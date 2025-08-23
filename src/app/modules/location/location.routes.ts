import { Router } from "express";
import { ROLES } from "../../config/constants";
// import { authenticateJWT } from "../../middlewares/authenticateJWT";
// import { authorizeRole } from "../../middlewares/authorizeRole";
import { authenticateAccess } from "../../middlewares/auth.middleware";
import { authorizeRole } from "../../middlewares/role.middleware";
import { nearbyDrivers } from "./location.controller";

export const locationRouter = Router();

/**
 * GET /api/location/nearby-drivers
 * Find nearby available drivers (rider)
 */
locationRouter.get(
  "/nearby-drivers",
  authenticateAccess,
  authorizeRole(ROLES.RIDER),
  nearbyDrivers
);
