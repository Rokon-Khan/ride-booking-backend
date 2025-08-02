import { Router } from "express";
import { ROLES } from "../../config/constants";
import { authenticateJWT } from "../../middlewares/authenticateJWT";
import { authorizeRole } from "../../middlewares/authorizeRole";
import { blockUser, listUsers, unblockUser, viewUser } from "./user.controller";

export const userRouter = Router();

/**
 * GET /api/users
 * List all users (admin)
 */
userRouter.get("/", authenticateJWT, authorizeRole([ROLES.ADMIN]), listUsers);

/**
 * GET /api/users/:id
 * View user details (admin)
 */
userRouter.get("/:id", authenticateJWT, authorizeRole([ROLES.ADMIN]), viewUser);

/**
 * PATCH /api/users/:id/block
 * Block user account (admin)
 */
userRouter.patch(
  "/:id/block",
  authenticateJWT,
  authorizeRole([ROLES.ADMIN]),
  blockUser
);

/**
 * PATCH /api/users/:id/unblock
 * Unblock user account (admin)
 */
userRouter.patch(
  "/:id/unblock",
  authenticateJWT,
  authorizeRole([ROLES.ADMIN]),
  unblockUser
);
