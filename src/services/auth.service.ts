import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import type { TransportOptions } from "nodemailer";
import crypto from "crypto";
import type { LoginRequest, RegisterRequest, JwtPayload, User, AuthRequest, } from "../types.ts";
import { generateToken, verifyToken } from "../utils/jwt.utils.js";
import { AppError } from "../middleware/error.middleware.js";
import { UserModel } from "../models/user.js";
import { SessionModel } from "../models/session.js";
import type { StringValue } from "ms";

export const registerUser = async (credentials: RegisterRequest, userAgent?: string): Promise<{ token: string; refreshToken: string }> => {
  const { name, email, password } = credentials;
  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }
  const user = await UserModel.findOne({ email });
  if (user) {
    throw new AppError("Email already exists", 400);
  }
  const newUser: User = {
    name,
    email,
    password,
  };
  const savedUser = await UserModel.create(newUser);

  const sessionId = crypto.randomUUID();
  const payload: JwtPayload = { userId: savedUser.id, email: savedUser.email, sessionId };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in the .env file");
  }
  const expires: StringValue = (process.env.JWT_EXPIRES_IN as StringValue) || "15m";

  const secret2 = process.env.JWT_REFRESH_SECRET;
  if (!secret2) {
    throw new Error("JWT_REFRESH_SECRET is not defined in the .env file");
  }
  const expires2: StringValue = (process.env.JWT_REFRESH_EXPIRES_IN as StringValue) || "7d";

  const token = generateToken(payload, secret, expires);
  const refreshToken = generateToken(payload, secret2, expires2);

  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  // Calculate expiration date for session TTL
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // roughly 7 days

  await SessionModel.create({
    userId: savedUser.id,
    sessionId,
    refreshTokenHash,
    userAgent: userAgent || "unknown",
    expiresAt
  });

  return { token, refreshToken };
};

export const loginUser = async (credentials: LoginRequest, userAgent?: string): Promise<{ token: string; refreshToken: string }> => {
  const { email, password } = credentials;
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email", 401);
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid password", 401);
  }

  const sessionId = crypto.randomUUID();
  const payload: JwtPayload = { userId: user.id, email: user.email, sessionId };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT_SECRET is not defined in the .env file", 500);
  }
  const expires: StringValue = (process.env.JWT_EXPIRES_IN as StringValue) || "15m";
  const token = generateToken(payload, secret, expires);

  const secret2 = process.env.JWT_REFRESH_SECRET;
  if (!secret2) {
    throw new Error("JWT_REFRESH_SECRET is not defined in the .env file");
  }
  const expires2: StringValue = (process.env.JWT_REFRESH_EXPIRES_IN as StringValue) || "7d";
  const refreshToken = generateToken(payload, secret2, expires2);

  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await SessionModel.create({
    userId: user.id,
    sessionId,
    refreshTokenHash,
    userAgent: userAgent || "unknown",
    expiresAt
  });

  return { token, refreshToken };
};

export const refreshTokenService = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const secretRefresh = process.env.JWT_REFRESH_SECRET;
    if (!secretRefresh) {
      throw new AppError("JWT_REFRESH_SECRET is not defined in the .env file", 500);
    }
    const decoded = verifyToken(refreshToken, secretRefresh);
    const { userId, email, sessionId } = decoded;

    if (!sessionId) {
      throw new AppError("Invalid token payload. Please login again.", 401);
    }

    const incomingHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const session = await SessionModel.findOne({ sessionId });

    if (!session) {
      throw new AppError("Session expired or invalid", 401);
    }
    if (session.refreshTokenHash !== incomingHash) {
      await SessionModel.deleteOne({ sessionId });
      throw new AppError("Security alert: Token reuse detected. You have been logged out.", 401);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const payload: JwtPayload = { userId: user.id, email: user.email, sessionId };
    const expiresAccessToken: StringValue = (process.env.JWT_EXPIRES_IN as StringValue) || "15m";
    const secretAccessToken = process.env.JWT_SECRET;
    if (!secretAccessToken) {
      throw new AppError("JWT_SECRET is not defined in the .env file", 500);
    }
    const accessToken = generateToken(payload, secretAccessToken, expiresAccessToken);
    const expiresRefreshToken: StringValue = (process.env.JWT_REFRESH_EXPIRES_IN as StringValue) || "7d";
    const newRefreshToken = generateToken(payload, secretRefresh, expiresRefreshToken);
    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await SessionModel.updateOne(
      { sessionId },
      { $set: { refreshTokenHash: newRefreshTokenHash, expiresAt } }
    );

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.log("Error in refreshTokenService:", error);
    throw error;
  }
}

export const logoutUserService = async (refreshToken: string): Promise<void> => {
  try {
    const secretRefresh = process.env.JWT_REFRESH_SECRET;
    if (!secretRefresh) return;
    const decoded = verifyToken(refreshToken, secretRefresh);
    if (decoded.sessionId) {
      await SessionModel.deleteOne({ sessionId: decoded.sessionId });
    }
  } catch (err) {
    // Intentionally ignored!
  }
};

export const changePasswordService = async (req: AuthRequest, currentPassword: string, newPassword: string): Promise<boolean> => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError("Current password is incorrect", 401);
  }
  user.password = newPassword;
  await user.save();
  await SessionModel.deleteMany({ userId });
  return true;
};

export const sendResetEmail = async (email: string, resetLink: string): Promise<Boolean> => {
  const smtpOptions = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  const transporter = nodemailer.createTransport(smtpOptions);
  try {
    await transporter.verify();
    console.log("SMTP connection successful");
  } catch (error) {
    console.error("SMTP verification failed:", error);
  }
  await transporter.sendMail({
    from: `"Task API" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset.</p>
      <p>
        <a href="${resetLink}">Reset Password</a>
      </p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
  return true;
};

export const resetPasswordService = async (token: string, password: string): Promise<boolean> => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await UserModel.findOne({ resetPasswordToken: tokenHash, resetPasswordExpire: { $gt: new Date() }, });
  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (isPasswordValid) {
    throw new AppError("New password cannot be same as current password", 400);
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  await SessionModel.deleteMany({ userId: user.id });

  return true;
};