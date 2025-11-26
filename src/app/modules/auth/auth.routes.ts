import { Router } from "express";
import { ROLES } from "../../config/constants";
import { authenticateAccess } from "../../middlewares/auth.middleware";
import { authorizeRole } from "../../middlewares/role.middleware";
import { AuthController } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/verify-email", AuthController.verifyEmail);
authRouter.post("/resend-otp", AuthController.resendOtp);
authRouter.post("/login", AuthController.login);
authRouter.post("/refresh-token", AuthController.refreshToken);
authRouter.post("/logout", authenticateAccess, AuthController.logout);
authRouter.post("/forgot-password", AuthController.forgotPassword);
authRouter.post("/reset-password", AuthController.resetPassword);
authRouter.get("/me", authenticateAccess, AuthController.me);
authRouter.patch("/me", authenticateAccess, AuthController.updateMe);
authRouter.post(
  "/trouble",
  authenticateAccess,
  authorizeRole(ROLES.RIDER, ROLES.DRIVER),
  AuthController.trouble
);
authRouter.get(
  "/notifications",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  AuthController.getNotifications
);
