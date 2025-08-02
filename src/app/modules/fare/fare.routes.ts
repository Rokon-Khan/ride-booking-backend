import { Router } from "express";
import { ROLES } from "../../config/constants";
import { authenticateJWT } from "../../middlewares/authenticateJWT";
import { authorizeRole } from "../../middlewares/authorizeRole";
import { fareEstimate } from "./fare.controller";

export const fareRouter = Router();

/**
 * GET /api/fare/estimate
 * Estimate ride fare (rider)
 */
fareRouter.get(
  "/estimate",
  authenticateJWT,
  authorizeRole([ROLES.RIDER]),
  fareEstimate
);
/**
 * GET /api/fare/estimate/:rideId
 * Get fare estimate for a specific ride (rider)
 */
fareRouter.get(
  "/estimate/:rideId",
  authenticateJWT,
  authorizeRole([ROLES.RIDER]),
  fareEstimate
);
