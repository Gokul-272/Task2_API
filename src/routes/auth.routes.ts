import { Router } from "express";
import { login, register, logout, refreshToken, changePassword, forgot, resetPassword } from "../controllers/auth.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { validate } from "../utils/validate.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", authenticateJWT, logout); // Usually just needs token validation, which is handled by authenticateJWT
router.post("/refresh", authenticateJWT, refreshToken);
router.post("/change-password", authenticateJWT, validate(changePasswordSchema), changePassword);
router.post("/forgot", validate(forgotPasswordSchema), forgot);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
