import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authenticateJWT";
import { login, logout, me, register } from "./auth.controller";

export const authRouter = Router();

/**
 * POST /api/auth/register
 * Register user (rider/driver)
 */
authRouter.post("/register", register);

/**
 * POST /api/auth/login
 * Login for all roles
 */
authRouter.post("/login", login);

/**
 * POST /api/auth/logout
 * Blacklist JWT (optional)
 */
authRouter.post("/logout", authenticateJWT, logout);

/**
 * GET /api/auth/me
 * Get current user profile
 */
authRouter.get("/me", authenticateJWT, me);
