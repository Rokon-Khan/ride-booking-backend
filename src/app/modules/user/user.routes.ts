import { Router } from "express";
import { ROLES } from "../../config/constants";
import { authenticateAccess } from "../../middlewares/auth.middleware";
// import { authorizeRole } from "../../middlewares/authorizeRole";
import { authorizeRole } from "../../middlewares/role.middleware";
import { blockUser, listUsers, unblockUser, viewUser } from "./user.controller";

export const userRouter = Router();

/**
 * GET /api/users
 * List all users (admin)
 */
userRouter.get("/", authenticateAccess, authorizeRole(ROLES.ADMIN), listUsers);

/**
 * GET /api/users/:id
 * View user details (admin)
 */
userRouter.get(
  "/:id",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  viewUser
);

/**
 * PATCH /api/users/:id/block
 * Block user account (admin)
 */
userRouter.patch(
  "/:id/block",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  blockUser
);

/**
 * PATCH /api/users/:id/unblock
 * Unblock user account (admin)
 */
userRouter.patch(
  "/:id/unblock",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  unblockUser
);
