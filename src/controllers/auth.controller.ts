import type { Request, Response, NextFunction } from "express";
import { loginUser, registerUser, refreshTokenService, changePasswordService, sendResetEmail, resetPasswordService, logoutUserService } from "../services/auth.service.js";
import type { AuthRequest, LoginRequest, RegisterRequest } from "../types.ts";
import { AppError } from "../middleware/error.middleware.js";
import { UserModel } from "../models/user.js";
import crypto from "crypto";

const isProd = process.env.NODE_ENV === "production";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const credentials = req.body as RegisterRequest;
    const userAgent = req.headers["user-agent"] || "unknown";
    const { token, refreshToken } = await registerUser(credentials, userAgent);
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const credentials = req.body as LoginRequest;
    const userAgent = req.headers["user-agent"] || "unknown";
    const { token, refreshToken } = await loginUser(credentials, userAgent);
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await logoutUserService(refreshToken);
    }
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;
    if (!refreshTokenCookie) {
      throw new AppError("No refresh token provided", 401);
    }
    const { accessToken, refreshToken: newRefreshToken } = await refreshTokenService(refreshTokenCookie);
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    next(error);
  }
}

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new AppError("Current password and new password are required", 400);
    }
    const passwordchange = await changePasswordService(req, currentPassword, newPassword);
    if (!passwordchange) {
      throw new AppError("Password change failed", 500);
    }
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError("Email is required", 400);
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Email not registered",
      });
      return;
    }
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;
    const sent = await sendResetEmail(user.email, resetLink);
    if (!sent) {
      throw new AppError("Reset link not sent", 500);
    }
    res.status(200).json({ success: true, message: "Reset link sent successfully", });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw new AppError("Token and password are required", 400);
    }
    const passwordchange = await resetPasswordService(token as string, newPassword as string);
    if (!passwordchange) {
      throw new AppError("Password reset failed", 500);
    }
    res.status(200).json({ success: true, message: "Password reset successfully", });
  } catch (error) {
    next(error);
  }
}