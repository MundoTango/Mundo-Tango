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
import { insertUserSchema } from "@shared/schema";
import logger from "../middleware/logger";

const router = Router();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);

const registerSchema = insertUserSchema.extend({
  password: z.string().min(8).max(100),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  name: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  twoFactorCode: z.string().optional(),
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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

router.get("/check-username/:username", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    logger.debug("[Auth] Checking username availability", { username });
    const existingUser = await storage.getUserByUsername(username);
    res.json({ available: !existingUser });
  } catch (error) {
    logger.error("[Auth] Username check error", { error: error instanceof Error ? error.message : error });
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/check-email/:email", async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    logger.debug("[Auth] Checking email availability", { email: decodeURIComponent(email) });
    const existingUser = await storage.getUserByEmail(decodeURIComponent(email));
    res.json({ available: !existingUser });
  } catch (error) {
    logger.error("[Auth] Email check error", { error: error instanceof Error ? error.message : error });
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    logger.info("[Auth] Registration attempt", { email: req.body.email, username: req.body.username });
    const validatedData = registerSchema.parse(req.body);

    const existingEmail = await storage.getUserByEmail(validatedData.email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const existingUsername = await storage.getUserByUsername(validatedData.username);
    if (existingUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, BCRYPT_ROUNDS);

    const user = await storage.createUser({
      ...validatedData,
      password: hashedPassword,
      isOnboardingComplete: false,
      formStatus: 0,
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await storage.createEmailVerificationToken({
      userId: user.id,
      token: verificationToken,
      expiresAt,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await storage.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiresAt,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      isVerified: user.isVerified,
      role: user.role,
      isOnboardingComplete: user.isOnboardingComplete,
      formStatus: user.formStatus,
    };

    logger.info("[Auth] Registration successful", { userId: user.id, email: user.email });
    res.status(201).json({
      message: "Registration successful",
      user: userResponse,
      accessToken,
      verificationToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    logger.error("[Auth] Registration error", { error: error instanceof Error ? error.message : error });
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    logger.info("[Auth] Login attempt", { email: req.body.email });
    const { email, password, twoFactorCode } = loginSchema.parse(req.body);

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

    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      isVerified: user.isVerified,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      // Include profile data needed for sidebar "My Stuff" section
      tangoRoles: (user as any).tango_roles || (user as any).tangoRoles || [],
      city: user.city,
      country: user.country,
      profileImage: user.profileImage,
      bio: user.bio,
    };

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    logger.info("[Auth] Login successful", { userId: user.id, email: user.email });
    res.json({
      message: "Login successful",
      accessToken,
      user: userResponse,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    logger.error("[Auth] Login error", { error: error instanceof Error ? error.message : error });
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  try {
    logger.info("[Auth] Logout request");
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await storage.deleteRefreshToken(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    logger.debug("[Auth] Logout successful");
    res.json({ message: "Logout successful" });
  } catch (error) {
    logger.error("[Auth] Logout error", { error: error instanceof Error ? error.message : error });
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
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    logger.debug("[Auth] Token refresh successful");
    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    logger.error("[Auth] Refresh token error", { error: error instanceof Error ? error.message : error });
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    logger.info("[Auth] Email verification attempt");
    const { token } = verifyEmailSchema.parse(req.body);

    const verificationToken = await storage.getEmailVerificationToken(token);
    if (!verificationToken) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    await storage.updateUser(verificationToken.userId, {
      isVerified: true,
    });

    await storage.deleteEmailVerificationToken(token);

    logger.info("[Auth] Email verified successfully", { userId: verificationToken.userId });
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    logger.error("[Auth] Email verification error", { error: error instanceof Error ? error.message : error });
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    logger.info("[Auth] Forgot password request", { email: req.body.email });
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await storage.getUserByEmail(email);
    if (!user) {
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

    logger.debug("[Auth] Password reset token created", { userId: user.id });
    res.json({ 
      message: "If the email exists, a password reset link has been sent",
      resetToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    logger.error("[Auth] Forgot password error", { error: error instanceof Error ? error.message : error });
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    logger.info("[Auth] Password reset attempt");
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    const resetToken = await storage.getPasswordResetToken(token);
    if (!resetToken) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await storage.updateUserPassword(resetToken.userId, hashedPassword);

    await storage.deletePasswordResetToken(token);
    await storage.deleteUserRefreshTokens(resetToken.userId);

    logger.info("[Auth] Password reset successful", { userId: resetToken.userId });
    res.json({ message: "Password reset successful" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    logger.error("[Auth] Reset password error", { error: error instanceof Error ? error.message : error });
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { password, ...userWithoutPassword } = req.user;

    // Map snake_case database fields to camelCase for frontend
    const userResponse = {
      ...userWithoutPassword,
      // Ensure tangoRoles is available (map from tango_roles if needed)
      tangoRoles: (userWithoutPassword as any).tango_roles || (userWithoutPassword as any).tangoRoles || [],
      // Ensure city and country are included
      city: userWithoutPassword.city,
      country: userWithoutPassword.country,
    };

    res.json({ user: userResponse });
  } catch (error) {
    logger.error("[Auth] Get current user error", { error: error instanceof Error ? error.message : error });
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/2fa/enable", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    logger.info("[Auth] 2FA enable request", { userId: req.user.id });

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

    logger.debug("[Auth] 2FA setup initiated", { userId: req.user.id });
    res.json({
      message: "2FA setup initiated",
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes,
    });
  } catch (error) {
    logger.error("[Auth] Enable 2FA error", { error: error instanceof Error ? error.message : error });
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

    logger.info("[Auth] 2FA enabled successfully", { userId: req.user.id });
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
    logger.error("[Auth] Verify 2FA error", { error: error instanceof Error ? error.message : error });
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

    logger.info("[Auth] 2FA disabled successfully", { userId: req.user.id });
    res.json({ message: "2FA disabled successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    logger.error("[Auth] Disable 2FA error", { error: error instanceof Error ? error.message : error });
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/change-password", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await storage.updateUser(req.user.id, { password: hashedPassword });

    logger.info("[Auth] Password changed successfully", { userId: req.user.id });
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    logger.error("[Auth] Change password error", { error: error instanceof Error ? error.message : error });
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
