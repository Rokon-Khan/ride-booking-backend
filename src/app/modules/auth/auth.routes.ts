// import { Router } from "express";
// import { authenticateJWT } from "../../middlewares/authenticateJWT";
// import { login, logout, me, register } from "./auth.controller";

// export const authRouter = Router();

// /**
//  * POST /api/auth/register
//  * Register user (rider/driver)
//  */
// authRouter.post("/register", register);

// /**
//  * POST /api/auth/login
//  * Login for all roles
//  */
// authRouter.post("/login", login);

// /**
//  * POST /api/auth/logout
//  * Blacklist JWT (optional)
//  */
// authRouter.post("/logout", authenticateJWT, logout);

// /**
//  * GET /api/auth/me
//  * Get current user profile
//  */
// authRouter.get("/me", authenticateJWT, me);

import { Router } from "express";
import { authenticateAccess } from "../../middlewares/auth.middleware";
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
