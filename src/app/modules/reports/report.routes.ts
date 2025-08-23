import { Router } from "express";
import { ROLES } from "../../config/constants";
// import { authenticateJWT } from "../../middlewares/authenticateJWT";
// import { authorizeRole } from "../../middlewares/authorizeRole";
import { authenticateAccess } from "../../middlewares/auth.middleware";
import { authorizeRole } from "../../middlewares/role.middleware";
import {
  driverStats,
  earningsStats,
  rideStats,
  userStats,
} from "./reports.controller";

export const reportsRouter = Router();

reportsRouter.get(
  "/rides",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  rideStats
);

reportsRouter.get(
  "/users",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  userStats
);

reportsRouter.get(
  "/drivers",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  driverStats
);

reportsRouter.get(
  "/earnings",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  earningsStats
);
