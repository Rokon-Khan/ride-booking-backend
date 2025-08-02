import { Router } from "express";
import { ROLES } from "../../config/constants";
import { authenticateJWT } from "../../middlewares/authenticateJWT";
import { authorizeRole } from "../../middlewares/authorizeRole";
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
  authenticateJWT,
  authorizeRole([ROLES.RIDER]),
  requestRide
);
rideRouter.patch(
  "/:id/cancel",
  authenticateJWT,
  authorizeRole([ROLES.RIDER]),
  cancelRide
);
rideRouter.get(
  "/history",
  authenticateJWT,
  authorizeRole([ROLES.RIDER]),
  rideHistory
);
rideRouter.get(
  "/current",
  authenticateJWT,
  authorizeRole([ROLES.RIDER]),
  currentRide
);
rideRouter.get(
  "/:id",
  authenticateJWT,
  authorizeRole([ROLES.RIDER, ROLES.ADMIN]),
  viewRide
);

// Driver endpoints
rideRouter.patch(
  "/:id/accept",
  authenticateJWT,
  authorizeRole([ROLES.DRIVER]),
  acceptRide
);
rideRouter.patch(
  "/:id/reject",
  authenticateJWT,
  authorizeRole([ROLES.DRIVER]),
  rejectRide
);
rideRouter.patch(
  "/:id/status",
  authenticateJWT,
  authorizeRole([ROLES.DRIVER, ROLES.ADMIN]),
  updateRideStatus
);
rideRouter.get(
  "/current",
  authenticateJWT,
  authorizeRole([ROLES.DRIVER]),
  driverCurrentRide
);
rideRouter.get(
  "/history",
  authenticateJWT,
  authorizeRole([ROLES.DRIVER]),
  driverHistory
);

// Admin endpoints
rideRouter.get(
  "/",
  authenticateJWT,
  authorizeRole([ROLES.ADMIN]),
  adminListRides
);
rideRouter.get(
  "/:id",
  authenticateJWT,
  authorizeRole([ROLES.ADMIN]),
  adminViewRide
);
rideRouter.patch(
  "/:id/status",
  authenticateJWT,
  authorizeRole([ROLES.ADMIN]),
  adminUpdateStatus
);
rideRouter.delete(
  "/:id",
  authenticateJWT,
  authorizeRole([ROLES.ADMIN]),
  adminDeleteRide
);
