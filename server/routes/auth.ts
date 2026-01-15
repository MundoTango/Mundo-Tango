import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { storage } from "../storage";
import { db } from "@shared/db";
import { emailVerificationTokens } from "@shared/schema";
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
// MB.MD Pattern 67: nomad/tango codes auto-complete email verification + onboarding
const VALID_INVITE_CODES = ["nomad", "tango"];


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

    // MB.MD Pattern 67: Valid invite codes (nomad/tango) auto-complete email verification + onboarding
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
      emailVerified: isValidInviteCode ? true : false,
      isOnboardingComplete: isValidInviteCode ? true : false,
      formStatus: isValidInviteCode ? 100 : 0,
      waitlist: isWaitlist,
      waitlistDate: isWaitlist ? new Date() : undefined,
    });

    // Auto-create city group if user registered with a city
    if ((validatedData as any).city) {
      try {
        const result = await ensureCityGroupExists(
          (validatedData as any).city,
          (validatedData as any).country || null,
          user.id
        );
        if (result?.wasCreated) {
          console.log(`[Auth] Auto-created city group for ${(validatedData as any).city}: ${result.groupName}`);
        }
      } catch (cityGroupError) {
        console.error("[Auth] Failed to create city group during registration:", cityGroupError);
      }
    }

    // MB.MD Pattern 67: Skip email verification for valid invite codes (nomad/tango)
    if (isValidInviteCode) {
      console.log(`[Auth] User ${user.id} registered with valid invite code '${inviteCode}' - auto-completed email verification and onboarding`);
      
      // Generate tokens immediately for valid invite code users
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      await storage.createRefreshToken({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return res.status(201).json({
        message: "Registration successful! Welcome to Mundo Tango.",
        requiresVerification: false,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          emailVerified: true,
          isOnboardingComplete: true,
        },
        accessToken,
        refreshToken,
      });
    }

    // Standard flow: Generate 6-digit verification code (easier for users to enter)
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await storage.createEmailVerificationToken({
      userId: user.id,
      token: verificationCode,
      expiresAt,
    });
    
    // Send verification email with 6-digit code (don't await - fire and forget to not block registration)
    // Pass userId for logging to email_logs table
    EmailService.sendVerificationCodeEmail(user.email, user.name || user.username, verificationCode, user.id)
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
      console.error("[Auth] Zod validation error details:", JSON.stringify(error.errors, null, 2));
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
      console.log(`[Auth] Login failed for ${email}: Invalid password`);
      // If user provided a valid invite code but wrong password, we should still fail
      // but maybe they just need to know it's a password issue
      return res.status(401).json({ 
        message: "Invalid email or password. Please try again.",
        isPasswordError: true 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    if (user.suspended) {
      return res.status(403).json({ message: "Account is suspended" });
    }

    // Check for valid invite code
    const trimmedCode = inviteCode?.toLowerCase().trim();
    const isValidInviteCode = trimmedCode && VALID_INVITE_CODES.includes(trimmedCode);

    console.log(`[Auth] Login attempt for ${email} with invite code: ${trimmedCode || 'none'}`);

    // MB.MD Pattern 67: If user provides valid invite code, bypass waitlist immediately
    if (isValidInviteCode && user.waitlist) {
      await storage.updateUser(user.id, { 
        waitlist: false,
        // If they use nomad/tango, we also consider them "verified" for the purpose of bypass
        // but the flow below will still trigger verification if isVerified is false
      });
      console.log(`[Auth] User ${user.id} bypassed waitlist with invite code '${trimmedCode}'`);
      user.waitlist = false;
    }

    // Check if user has verified their email
    if (!user.isVerified) {
      // MB.MD Pattern 67: If user provides valid invite code and is unverified,
      // send verification email and redirect to verification flow
      if (isValidInviteCode) {
        // Generate new verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        // Delete any existing verification tokens for this user
        await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, user.id));
        
        // Create new verification token
        await storage.createEmailVerificationToken({
          userId: user.id,
          token: verificationCode,
          expiresAt,
        });
        
        // Send verification email (fire and forget)
        EmailService.sendVerificationCodeEmail(user.email, user.name || user.username, verificationCode)
          .then(sent => {
            if (sent) {
              console.log(`[Auth] Verification email sent to ${user.email} via invite code '${trimmedCode}'`);
            }
          })
          .catch(err => console.error('[Auth] Failed to send verification email:', err));
        
        console.log(`[Auth] User ${user.id} used invite code '${trimmedCode}' - sending verification email`);
        
        return res.status(403).json({ 
          message: "Verification email sent! Please check your inbox for the 6-digit code.",
          requiresVerification: true,
          email: user.email,
          emailSent: true
        });
      }
      
      // No invite code - standard verification required message
      return res.status(403).json({ 
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        requiresVerification: true,
        email: user.email
      });
    }

    // Check if user is on waitlist (if no invite code was used or it was invalid)
    if (user.waitlist) {
      return res.status(403).json({ 
        message: "You are currently on the waitlist. Use an invite code like 'nomad' to get instant access!",
        onWaitlist: true 
      });
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
  let step = "init";
  try {
    // Log request details immediately for debugging production issues
    console.log("[Auth] Verify-email request received");
    console.log("[Auth] Content-Type:", req.headers["content-type"]);
    console.log("[Auth] Body type:", typeof req.body);
    console.log("[Auth] Body keys:", req.body ? Object.keys(req.body) : "null/undefined");
    
    step = "parsing";
    // Defensive check for body parsing issues
    if (!req.body || typeof req.body !== "object") {
      console.error("[Auth] Request body is not an object:", req.body);
      return res.status(400).json({ 
        message: "Invalid request body. Expected JSON object.",
        step
      });
    }
    
    console.log("[Auth] Verify email request body:", JSON.stringify(req.body));
    const { token } = verifyEmailSchema.parse(req.body);
    console.log("[Auth] Parsed token:", token);

    step = "token_lookup";
    let verificationToken;
    try {
      verificationToken = await storage.getEmailVerificationToken(token);
    } catch (lookupError) {
      console.error("[Auth] Token lookup failed:", lookupError);
      return res.status(500).json({ 
        message: "Database error during token lookup", 
        step,
        error: lookupError instanceof Error ? lookupError.message : "Unknown"
      });
    }
    console.log("[Auth] Verification token lookup result:", verificationToken ? `Found for userId ${verificationToken.userId}` : "Not found");
    
    if (!verificationToken) {
      return res.status(400).json({ message: "Invalid or expired verification code. Please request a new code." });
    }

    // Get user first to ensure they exist
    step = "user_lookup";
    let user;
    try {
      user = await storage.getUserById(verificationToken.userId);
    } catch (userError) {
      console.error("[Auth] User lookup failed:", userError);
      return res.status(500).json({ 
        message: "Database error during user lookup", 
        step,
        error: userError instanceof Error ? userError.message : "Unknown"
      });
    }
    console.log("[Auth] User lookup result:", user ? `Found ${user.email}` : "Not found");
    
    if (!user) {
      // Clean up orphaned token
      await storage.deleteEmailVerificationToken(token);
      return res.status(400).json({ message: "User account not found. Please register again." });
    }

    // Update user verification status
    step = "update_user";
    try {
      await storage.updateUser(verificationToken.userId, {
        isVerified: true,
      });
      console.log("[Auth] User verification status updated");
    } catch (updateError) {
      console.error("[Auth] Failed to update user verification status:", updateError);
      return res.status(500).json({ message: "Failed to update verification status. Please try again." });
    }

    // Delete verification token
    step = "delete_token";
    try {
      await storage.deleteEmailVerificationToken(token);
      console.log("[Auth] Verification token deleted");
    } catch (deleteError) {
      console.error("[Auth] Failed to delete verification token:", deleteError);
      // Non-critical - continue with login
    }

    step = "generate_tokens";
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    try {
      await storage.createRefreshToken({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      console.log("[Auth] Refresh token created for user:", user.id);
    } catch (refreshError) {
      console.error("[Auth] Failed to create refresh token:", refreshError);
      // Still return success - user is verified, they can login manually
    }

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    console.log("[Auth] Email verification successful for:", user.email);
    res.json({ 
      message: "Email verified successfully",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: true,
        onboardingCompleted: user.isOnboardingComplete,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[Auth] Zod validation error:", error.errors);
      return res.status(400).json({ 
        message: "Invalid verification code format", 
        errors: error.errors 
      });
    }
    console.error(`[Auth] Email verification error at step "${step}":`, error);
    console.error("[Auth] Error stack:", error instanceof Error ? error.stack : "No stack");
    res.status(500).json({ 
      message: "Verification failed. Please try again or request a new code.",
      step,
      error: error instanceof Error ? error.message : "Unknown error"
    });
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
    const existingToken = await storage.getEmailVerificationTokenByUserId(user.id);
    if (existingToken) {
      await storage.deleteEmailVerificationToken(existingToken.token);
    }
    
    // Generate new 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await storage.createEmailVerificationToken({
      userId: user.id,
      token: verificationCode,
      expiresAt,
    });
    
    // Send verification email with code (pass userId for logging)
    await EmailService.sendVerificationCodeEmail(user.email, user.name || user.username, verificationCode, user.id);
    
    res.json({ message: "If an account exists with this email, a verification code has been sent." });
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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

router.post("/change-password", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await storage.getUserById(req.user.id);
    if (!user || !user.password) {
      return res.status(400).json({ message: "User not found or no password set" });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await storage.updateUserPassword(req.user.id, hashedPassword);

    await storage.deleteUserRefreshTokens(req.user.id);

    console.log(`[Auth] Password changed successfully for user: ${req.user.email}`);
    res.json({ message: "Password changed successfully. Please log in again." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Change password error:", error);
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

    // MB.MD Performance: Set short cache header for client-side caching
    res.set('Cache-Control', 'private, max-age=10');
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

// Test endpoint for E2E testing - get verification token by email
// Only available in development mode
if (process.env.NODE_ENV !== "production") {
  router.get("/test/verification-token", async (req: Request, res: Response) => {
    try {
      const { email } = req.query;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = await storage.getEmailVerificationTokenByUserId(user.id);
      if (!token) {
        return res.status(404).json({ message: "No verification token found" });
      }

      res.json({ token: token.token, userId: user.id, email: user.email });
    } catch (error) {
      console.error("Test verification token error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}

// Protected maintenance endpoint for cleaning up corrupted user accounts
// This is env-guarded and should be removed/disabled after use
router.post("/internal/maintenance/cleanup-users", async (req: Request, res: Response) => {
  try {
    // Security: Validate maintenance token
    const maintenanceToken = req.headers["x-maintenance-token"];
    const expectedToken = process.env.MAINTENANCE_TOKEN;
    
    if (!expectedToken) {
      console.error("[Maintenance] MAINTENANCE_TOKEN env var not set");
      return res.status(503).json({ message: "Maintenance endpoint not configured" });
    }
    
    if (maintenanceToken !== expectedToken) {
      console.warn("[Maintenance] Invalid maintenance token attempt");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { emailPattern } = req.body;
    if (!emailPattern || typeof emailPattern !== "string") {
      return res.status(400).json({ message: "emailPattern is required" });
    }

    // Safety check: only allow patterns from env var (comma-separated)
    const allowedPatternsEnv = process.env.MAINTENANCE_ALLOWED_PATTERNS;
    if (!allowedPatternsEnv) {
      console.error("[Maintenance] MAINTENANCE_ALLOWED_PATTERNS env var not set");
      return res.status(503).json({ message: "Maintenance patterns not configured" });
    }
    
    const allowedPatterns = allowedPatternsEnv.split(",").map(p => p.trim());
    if (!allowedPatterns.includes(emailPattern)) {
      console.warn(`[Maintenance] Rejected pattern: ${emailPattern}`);
      return res.status(400).json({ message: "Invalid email pattern" });
    }

    console.log(`[Maintenance] Starting cleanup for pattern: ${emailPattern}`);

    // Use raw SQL with snake_case column names for production compatibility
    const { db } = await import("../db");
    const { sql } = await import("drizzle-orm");

    // Step 1: Get all user IDs matching the pattern
    const usersResult = await db.execute(
      sql`SELECT id, email FROM users WHERE email LIKE ${emailPattern}`
    );
    const users = usersResult.rows as { id: number; email: string }[];
    console.log(`[Maintenance] Found ${users.length} users to clean up:`, users.map(u => u.email));

    if (users.length === 0) {
      return res.json({ message: "No users found matching pattern", deletedCount: 0 });
    }

    const userIds = users.map(u => u.id);

    // Step 2: Delete all related tokens (using snake_case column names)
    let deletedTokens = { email: 0, refresh: 0, password: 0, twoFactor: 0 };

    for (const userId of userIds) {
      // Delete email verification tokens
      const emailResult = await db.execute(
        sql`DELETE FROM email_verification_tokens WHERE user_id = ${userId}`
      );
      deletedTokens.email += (emailResult.rowCount || 0);

      // Delete refresh tokens
      const refreshResult = await db.execute(
        sql`DELETE FROM refresh_tokens WHERE user_id = ${userId}`
      );
      deletedTokens.refresh += (refreshResult.rowCount || 0);

      // Delete password reset tokens
      const passwordResult = await db.execute(
        sql`DELETE FROM password_reset_tokens WHERE user_id = ${userId}`
      );
      deletedTokens.password += (passwordResult.rowCount || 0);

      // Delete two factor secrets
      const twoFactorResult = await db.execute(
        sql`DELETE FROM two_factor_secrets WHERE user_id = ${userId}`
      );
      deletedTokens.twoFactor += (twoFactorResult.rowCount || 0);
    }

    console.log(`[Maintenance] Deleted tokens:`, deletedTokens);

    // Step 3: Delete the users
    const deleteUsersResult = await db.execute(
      sql`DELETE FROM users WHERE email LIKE ${emailPattern}`
    );
    const deletedUsersCount = deleteUsersResult.rowCount || 0;

    console.log(`[Maintenance] Deleted ${deletedUsersCount} users`);

    res.json({
      message: "Cleanup completed successfully",
      deletedUsers: deletedUsersCount,
      deletedTokens,
      emails: users.map(u => u.email)
    });
  } catch (error) {
    console.error("[Maintenance] Cleanup error:", error);
    res.status(500).json({ 
      message: "Cleanup failed", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Diagnostic endpoint to check database schema
router.get("/internal/maintenance/diagnose", async (req: Request, res: Response) => {
  try {
    const maintenanceToken = req.headers["x-maintenance-token"];
    const expectedToken = process.env.MAINTENANCE_TOKEN;
    
    if (!expectedToken || maintenanceToken !== expectedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { db } = await import("../db");
    const { sql } = await import("drizzle-orm");

    // Check email_verification_tokens schema
    const evtSchema = await db.execute(
      sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'email_verification_tokens'`
    );

    // Check for any verification tokens
    const tokenCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM email_verification_tokens`
    );

    // Check users table schema
    const usersSchema = await db.execute(
      sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' LIMIT 20`
    );

    res.json({
      emailVerificationTokensSchema: evtSchema.rows,
      tokenCount: tokenCount.rows[0],
      usersSchema: usersSchema.rows
    });
  } catch (error) {
    console.error("[Maintenance] Diagnose error:", error);
    res.status(500).json({ 
      message: "Diagnose failed", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Detailed user/token diagnostic endpoint
router.get("/internal/maintenance/diagnose-user", async (req: Request, res: Response) => {
  try {
    const maintenanceToken = req.headers["x-maintenance-token"];
    const expectedToken = process.env.MAINTENANCE_TOKEN;
    
    if (!expectedToken || maintenanceToken !== expectedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ message: "Email parameter required" });
    }

    const { db } = await import("../db");
    const { sql } = await import("drizzle-orm");

    // Get user by email
    const userResult = await db.execute(
      sql`SELECT id, email, is_verified, is_active, name, username FROM users WHERE email = ${email}`
    );

    // Get verification tokens for this user
    let tokensResult = { rows: [] as any[] };
    if (userResult.rows.length > 0) {
      const userId = (userResult.rows[0] as any).id;
      tokensResult = await db.execute(
        sql`SELECT id, user_id, token, expires_at, created_at FROM email_verification_tokens WHERE user_id = ${userId}`
      );
    }

    // Get all recent tokens
    const recentTokens = await db.execute(
      sql`SELECT id, user_id, token, expires_at, created_at FROM email_verification_tokens ORDER BY created_at DESC LIMIT 5`
    );

    res.json({
      user: userResult.rows[0] || null,
      userTokens: tokensResult.rows,
      recentTokens: recentTokens.rows
    });
  } catch (error) {
    console.error("[Maintenance] Diagnose-user error:", error);
    res.status(500).json({ 
      message: "Diagnose failed", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export default router;
