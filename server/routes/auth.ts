import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { z } from "zod";
import { storage } from "../storage";
import {
  authenticateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  type AuthRequest,
} from "../middleware/auth";
// Note: insertUserSchema not imported - using direct z.object() for registerSchema to avoid Zod v4 .extend() issues
import { ensureCityGroupExists } from "../utils/cityGroupAutomation";
import { EmailService } from "../services/EmailService";

const router = Router();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);

// Define registerSchema directly to avoid Zod v4 .extend() compatibility issues
const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8).max(100),
  inviteCode: z.string().optional(),
});

// Valid invite codes that grant immediate access (not waitlist)
const VALID_INVITE_CODES = ["nomad"];

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  twoFactorCode: z.string().optional(),
  inviteCode: z.string().optional(),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

const verify2FASchema = z.object({
  code: z.string().length(6),
});

const waitlistSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  username: z.string().min(3).max(30).optional(),
  password: z.string().min(8).max(100).optional(),
});

router.get("/check-username/:username", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const existingUser = await storage.getUserByUsername(username);
    res.json({ available: !existingUser });
  } catch (error) {
    console.error("Username check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/check-email/:email", async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const existingUser = await storage.getUserByEmail(decodeURIComponent(email));
    res.json({ available: !existingUser });
  } catch (error) {
    console.error("Email check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    // Extract inviteCode before validation (optional field)
    const rawInviteCode = req.body.inviteCode as string | undefined;
    
    const validatedData = registerSchema.parse(req.body);

    const existingEmail = await storage.getUserByEmail(validatedData.email as string);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const existingUsername = await storage.getUserByUsername(validatedData.username as string);
    if (existingUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password as string, BCRYPT_ROUNDS);

    // Check if invite code is valid - determines waitlist status
    const inviteCode = rawInviteCode?.toLowerCase().trim();
    const isValidInviteCode = inviteCode && VALID_INVITE_CODES.includes(inviteCode);
    const isWaitlist = !isValidInviteCode;

    // Remove inviteCode from user data before creating (it's not a user field)
    const { inviteCode: _inviteCode, ...userData } = validatedData as any;

    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
      isOnboardingComplete: false,
      formStatus: 0,
      waitlist: isWaitlist,
      waitlistDate: isWaitlist ? new Date() : undefined,
    });

    // Auto-create city group if user registered with a city
    if (validatedData.city) {
      try {
        const result = await ensureCityGroupExists(
          validatedData.city,
          validatedData.country || null,
          user.id
        );
        if (result?.wasCreated) {
          console.log(`[Auth] Auto-created city group for ${validatedData.city}: ${result.groupName}`);
        }
      } catch (cityGroupError) {
        console.error("[Auth] Failed to create city group during registration:", cityGroupError);
      }
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await storage.createEmailVerificationToken({
      userId: user.id,
      token: verificationToken,
      expiresAt,
    });
    
    // Send verification email (don't await - fire and forget to not block registration)
    EmailService.sendVerificationEmail(user.email, user.name || user.username, verificationToken)
      .then(sent => {
        if (sent) {
          console.log(`[Auth] Verification email sent to ${user.email}`);
        }
      })
      .catch(err => console.error('[Auth] Failed to send verification email:', err));

    // Do NOT issue tokens yet - user must verify email first
    // This prevents users from bypassing email verification
    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      requiresVerification: true,
      email: user.email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Registration error:", error);
    console.error("Registration error stack:", error instanceof Error ? error.stack : "No stack");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, twoFactorCode, inviteCode } = loginSchema.parse(req.body);

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    if (user.suspended) {
      return res.status(403).json({ message: "Account is suspended" });
    }

    // Check if user has verified their email
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        requiresVerification: true,
        email: user.email
      });
    }

    // Check if user is on waitlist and provided valid invite code to upgrade
    const trimmedCode = inviteCode?.toLowerCase().trim();
    const isValidInviteCode = trimmedCode && VALID_INVITE_CODES.includes(trimmedCode);
    
    if (user.waitlist && isValidInviteCode) {
      // Upgrade user from waitlist to full access
      await storage.updateUser(user.id, { waitlist: false });
      console.log(`[Auth] User ${user.id} upgraded from waitlist with invite code`);
    }

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(403).json({ 
          message: "Two-factor authentication required",
          requires2FA: true 
        });
      }

      const twoFactorSecret = await storage.getTwoFactorSecret(user.id);
      if (!twoFactorSecret) {
        return res.status(500).json({ message: "2FA configuration error" });
      }

      const isValidCode = speakeasy.totp.verify({
        secret: twoFactorSecret.secret,
        encoding: "base32",
        token: twoFactorCode,
        window: 2,
      });

      const isBackupCode = twoFactorSecret.backupCodes?.includes(twoFactorCode);

      if (!isValidCode && !isBackupCode) {
        return res.status(401).json({ message: "Invalid 2FA code" });
      }

      if (isBackupCode) {
        const updatedBackupCodes = twoFactorSecret.backupCodes!.filter(
          code => code !== twoFactorCode
        );
        await storage.updateTwoFactorSecret(user.id, {
          backupCodes: updatedBackupCodes,
        });
      }
    }

    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    await storage.updateUser(user.id, {
      lastLoginAt: new Date(),
      lastLoginIp: clientIp,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );
    await storage.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiresAt,
    });

    // Determine current waitlist status (may have been upgraded above)
    const wasUpgraded = user.waitlist && isValidInviteCode;
    const currentWaitlist = wasUpgraded ? false : user.waitlist;
    
    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      isVerified: user.isVerified,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      waitlist: currentWaitlist,
    };

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      message: wasUpgraded ? "Login successful - Account upgraded!" : "Login successful",
      accessToken,
      user: userResponse,
      upgraded: wasUpgraded,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await storage.deleteRefreshToken(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/waitlist", async (req: Request, res: Response) => {
  try {
    const validatedData = waitlistSchema.parse(req.body);

    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      if (existingUser.waitlist) {
        return res.status(409).json({ message: "You're already on the waitlist!" });
      }
      return res.status(409).json({ message: "This email is already registered. Please sign in instead." });
    }

    // Use provided username or generate temp one
    let finalUsername = validatedData.username;
    if (finalUsername) {
      const existingUsername = await storage.getUserByUsername(finalUsername);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken. Please choose another." });
      }
    } else {
      finalUsername = `waitlist_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }
    
    // Use provided password or generate random one
    const finalPassword = validatedData.password 
      ? await bcrypt.hash(validatedData.password, BCRYPT_ROUNDS)
      : await bcrypt.hash(crypto.randomBytes(32).toString("hex"), BCRYPT_ROUNDS);

    await storage.createUser({
      email: validatedData.email,
      name: validatedData.name || "Waitlist User",
      username: finalUsername,
      password: finalPassword,
      waitlist: true,
      waitlistDate: new Date(),
      isActive: false,
    });

    res.status(201).json({
      message: "You've been added to the waitlist! We'll notify you when registration opens.",
      success: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Waitlist signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const storedToken = await storage.getRefreshToken(refreshToken);
    if (!storedToken) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await storage.getUserById(payload.userId);

    if (!user || !user.isActive || user.suspended) {
      return res.status(401).json({ message: "Invalid user" });
    }

    await storage.deleteRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const refreshExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );
    await storage.createRefreshToken({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: refreshExpiresAt,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);

    const verificationToken = await storage.getEmailVerificationToken(token);
    if (!verificationToken) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    await storage.updateUser(verificationToken.userId, {
      isVerified: true,
    });

    await storage.deleteEmailVerificationToken(token);

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET endpoint for email verification (for clicking links in emails)
router.get("/verify-email/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    if (!token || token.length < 32) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    const verificationToken = await storage.getEmailVerificationToken(token);
    if (!verificationToken) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    // Check if token has expired
    if (verificationToken.expiresAt && new Date() > verificationToken.expiresAt) {
      await storage.deleteEmailVerificationToken(token);
      return res.status(400).json({ message: "Verification token has expired. Please request a new one." });
    }

    await storage.updateUser(verificationToken.userId, {
      isVerified: true,
    });

    await storage.deleteEmailVerificationToken(token);

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Resend verification email endpoint
const resendVerificationSchema = z.object({
  email: z.string().email(),
});

// Track resend attempts per email (in-memory rate limiting)
const resendAttempts = new Map<string, { count: number; firstAttempt: Date }>();

router.post("/resend-verification", async (req: Request, res: Response) => {
  try {
    const { email } = resendVerificationSchema.parse(req.body);
    
    // Rate limiting: max 3 resends per hour per email
    const now = new Date();
    const attempts = resendAttempts.get(email);
    
    if (attempts) {
      const hoursSinceFirst = (now.getTime() - attempts.firstAttempt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceFirst < 1 && attempts.count >= 3) {
        return res.status(429).json({ 
          message: "Too many verification requests. Please try again later.",
          retryAfter: Math.ceil(60 - (hoursSinceFirst * 60))
        });
      }
      
      if (hoursSinceFirst >= 1) {
        resendAttempts.set(email, { count: 1, firstAttempt: now });
      } else {
        resendAttempts.set(email, { count: attempts.count + 1, firstAttempt: attempts.firstAttempt });
      }
    } else {
      resendAttempts.set(email, { count: 1, firstAttempt: now });
    }
    
    const user = await storage.getUserByEmail(email);
    
    // Don't reveal if email exists or not for security
    if (!user) {
      return res.json({ message: "If an account exists with this email, a verification link has been sent." });
    }
    
    if (user.isVerified) {
      return res.json({ message: "Your email is already verified. You can log in." });
    }
    
    // Delete any existing verification tokens for this user
    const existingToken = await storage.getEmailVerificationTokenByUserId?.(user.id);
    if (existingToken) {
      await storage.deleteEmailVerificationToken(existingToken.token);
    }
    
    // Create new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await storage.createEmailVerificationToken({
      userId: user.id,
      token: verificationToken,
      expiresAt,
    });
    
    // Send verification email
    await EmailService.sendVerificationEmail(user.email, user.name || user.username, verificationToken);
    
    res.json({ message: "If an account exists with this email, a verification link has been sent." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Security: Don't reveal if email exists
      return res.json({ 
        message: "If the email exists, a password reset link has been sent" 
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await storage.deleteUserPasswordResetTokens(user.id);
    
    await storage.createPasswordResetToken({
      userId: user.id,
      token: resetToken,
      expiresAt,
    });

    // Send the password reset email
    const emailSent = await EmailService.sendPasswordResetEmail(
      user.email,
      user.name || user.username || 'Tango Dancer',
      resetToken
    );
    
    if (!emailSent) {
      console.error(`[Auth] Failed to send password reset email to ${email}`);
    }

    // Always return success message (don't reveal email existence)
    const response: { message: string; resetToken?: string } = { 
      message: "If the email exists, a password reset link has been sent"
    };
    
    // Only include resetToken in development for testing
    if (process.env.NODE_ENV !== 'production') {
      response.resetToken = resetToken;
    }
    
    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    const resetToken = await storage.getPasswordResetToken(token);
    if (!resetToken) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await storage.updateUserPassword(resetToken.userId, hashedPassword);

    await storage.deletePasswordResetToken(token);
    await storage.deleteUserRefreshTokens(resetToken.userId);

    res.json({ message: "Password reset successful" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { password, ...userWithoutPassword } = req.user;

    // Ensure tangoRoles is always an array and city/country are included
    const userResponse = {
      ...userWithoutPassword,
      tangoRoles: userWithoutPassword.tangoRoles ?? [],
      city: userWithoutPassword.city ?? null,
      country: userWithoutPassword.country ?? null,
    };

    res.json({ user: userResponse });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/2fa/enable", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is already enabled" });
    }

    const secret = speakeasy.generateSecret({
      name: `Mundo Tango (${req.user.email})`,
      length: 32,
    });

    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString("hex")
    );

    await storage.createTwoFactorSecret({
      userId: req.user.id,
      secret: secret.base32,
      backupCodes,
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    res.json({
      message: "2FA setup initiated",
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes,
    });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/2fa/verify", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { code } = verify2FASchema.parse(req.body);

    const twoFactorSecret = await storage.getTwoFactorSecret(req.user.id);
    if (!twoFactorSecret) {
      return res.status(400).json({ message: "2FA not set up" });
    }

    const isValid = speakeasy.totp.verify({
      secret: twoFactorSecret.secret,
      encoding: "base32",
      token: code,
      window: 2,
    });

    if (!isValid) {
      return res.status(401).json({ message: "Invalid 2FA code" });
    }

    await storage.updateUser(req.user.id, {
      twoFactorEnabled: true,
    });

    res.json({ 
      message: "2FA enabled successfully",
      backupCodes: twoFactorSecret.backupCodes 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Verify 2FA error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/2fa/disable", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!req.user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is not enabled" });
    }

    const { code } = verify2FASchema.parse(req.body);

    const twoFactorSecret = await storage.getTwoFactorSecret(req.user.id);
    if (!twoFactorSecret) {
      return res.status(400).json({ message: "2FA configuration error" });
    }

    const isValidCode = speakeasy.totp.verify({
      secret: twoFactorSecret.secret,
      encoding: "base32",
      token: code,
      window: 2,
    });

    const isBackupCode = twoFactorSecret.backupCodes?.includes(code);

    if (!isValidCode && !isBackupCode) {
      return res.status(401).json({ message: "Invalid 2FA code" });
    }

    await storage.updateUser(req.user.id, {
      twoFactorEnabled: false,
    });

    await storage.deleteTwoFactorSecret(req.user.id);

    res.json({ message: "2FA disabled successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Disable 2FA error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
