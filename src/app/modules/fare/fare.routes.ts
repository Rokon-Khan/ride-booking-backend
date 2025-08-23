import { Router } from "express";
import { ROLES } from "../../config/constants";
// import { authenticateJWT } from "../../middlewares/authenticateJWT";
// import { authorizeRole } from "../../middlewares/authorizeRole";
import { authenticateAccess } from "../../middlewares/auth.middleware";
import { authorizeRole } from "../../middlewares/role.middleware";
import { fareEstimate } from "./fare.controller";

export const fareRouter = Router();

/**
 * GET /api/fare/estimate
 * Estimate ride fare (rider)
 */
fareRouter.get(
  "/estimate",
  authenticateAccess,
  authorizeRole(ROLES.RIDER),
  fareEstimate
);
/**
 * GET /api/fare/estimate/:rideId
 * Get fare estimate for a specific ride (rider)
 */
fareRouter.get(
  "/estimate/:rideId",
  authenticateAccess,
  authorizeRole(ROLES.RIDER),
  fareEstimate
);
