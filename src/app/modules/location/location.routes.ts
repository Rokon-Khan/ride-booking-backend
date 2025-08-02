import { Router } from "express";
import { ROLES } from "../../config/constants";
import { authenticateJWT } from "../../middlewares/authenticateJWT";
import { authorizeRole } from "../../middlewares/authorizeRole";
import { nearbyDrivers } from "./location.controller";

export const locationRouter = Router();

/**
 * GET /api/location/nearby-drivers
 * Find nearby available drivers (rider)
 */
locationRouter.get(
  "/nearby-drivers",
  authenticateJWT,
  authorizeRole([ROLES.RIDER]),
  nearbyDrivers
);
