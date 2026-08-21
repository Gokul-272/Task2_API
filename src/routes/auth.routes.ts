import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
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

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authenticateJWT, authController.logout);
router.post("/refresh", authenticateJWT, authController.refreshToken);
router.post("/change-password", authenticateJWT, validate(changePasswordSchema), authController.changePassword);
router.post("/forgot", validate(forgotPasswordSchema), authController.forgot);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

export default router;
