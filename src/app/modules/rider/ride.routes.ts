import { Router } from "express";
import { ROLES } from "../../config/constants";
import { authenticateAccess } from "../../middlewares/auth.middleware";
import { authorizeRole } from "../../middlewares/role.middleware";
import {
  acceptRide,
  adminDeleteRide,
  adminListRides,
  adminUpdateStatus,
  adminViewRide,
  cancelRide,
  currentRide,
  driverCurrentRide,
  driverHistory,
  rejectRide,
  requestRide,
  rideHistory,
  updateRideStatus,
  viewRide,
} from "./ride.controller";

export const rideRouter = Router();

// Rider endpoints
rideRouter.post(
  "/request",
  authenticateAccess,
  authorizeRole(ROLES.RIDER),
  requestRide
);
rideRouter.patch(
  "/:id/cancel",
  authenticateAccess,
  authorizeRole(ROLES.RIDER),
  cancelRide
);
rideRouter.get(
  "/history",
  authenticateAccess,
  authorizeRole(ROLES.RIDER),
  rideHistory
);
rideRouter.get(
  "/current",
  authenticateAccess,
  authorizeRole(ROLES.RIDER),
  currentRide
);
rideRouter.get(
  "/:id",
  authenticateAccess,
  authorizeRole(ROLES.RIDER, ROLES.ADMIN),
  viewRide
);

// Driver endpoints
rideRouter.patch(
  "/:id/accept",
  authenticateAccess,
  authorizeRole(ROLES.DRIVER),
  acceptRide
);
rideRouter.patch(
  "/:id/reject",
  authenticateAccess,
  authorizeRole(ROLES.DRIVER),
  rejectRide
);
rideRouter.patch(
  "/:id/status",
  authenticateAccess,
  authorizeRole(ROLES.DRIVER, ROLES.ADMIN),
  updateRideStatus
);
rideRouter.get(
  "/current",
  authenticateAccess,
  authorizeRole(ROLES.DRIVER),
  driverCurrentRide
);
rideRouter.get(
  "/history",
  authenticateAccess,
  authorizeRole(ROLES.DRIVER),
  driverHistory
);

// Admin endpoints
rideRouter.get(
  "/",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  adminListRides
);
rideRouter.get(
  "/:id",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  adminViewRide
);
rideRouter.patch(
  "/:id/status",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  adminUpdateStatus
);
rideRouter.delete(
  "/:id",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  adminDeleteRide
);
