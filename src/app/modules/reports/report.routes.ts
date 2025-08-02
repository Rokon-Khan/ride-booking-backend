import { Router } from "express";
import { ROLES } from "../../config/constants";
import { authenticateJWT } from "../../middlewares/authenticateJWT";
import { authorizeRole } from "../../middlewares/authorizeRole";
import {
  driverStats,
  earningsStats,
  rideStats,
  userStats,
} from "./reports.controller";

export const reportsRouter = Router();

reportsRouter.get(
  "/rides",
  authenticateJWT,
  authorizeRole([ROLES.ADMIN]),
  rideStats
);

reportsRouter.get(
  "/users",
  authenticateJWT,
  authorizeRole([ROLES.ADMIN]),
  userStats
);

reportsRouter.get(
  "/drivers",
  authenticateJWT,
  authorizeRole([ROLES.ADMIN]),
  driverStats
);

reportsRouter.get(
  "/earnings",
  authenticateJWT,
  authorizeRole([ROLES.ADMIN]),
  earningsStats
);
