import { Router } from "express";
import { ROLES } from "../../config/constants";
import { authenticateAccess } from "../../middlewares/auth.middleware";
import { authorizeRole } from "../../middlewares/role.middleware";
import {
  approveDriver,
  availableRides,
  earningsHistory,
  getAvailability,
  getCurrentRide,
  getVehicleDetails,
  listDrivers,
  reactivateDriver,
  setAvailability,
  suspendDriver,
  updateVehicleDetails,
} from "./driver.controller";

export const driverRouter = Router();

/**
 * GET /api/drivers
 * List all drivers (admin)
 */
driverRouter.get(
  "/",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  listDrivers
);

/**
 * PATCH /api/drivers/:id/approve
 * Approve driver (admin)
 */
driverRouter.patch(
  "/:id/approve",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  approveDriver
);

/**
 * PATCH /api/drivers/:id/suspend
 * Suspend driver (admin)
 */
driverRouter.patch(
  "/:id/suspend",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  suspendDriver
);

/**
 * PATCH /api/drivers/:id/reactivate
 * Reactivate driver (admin)
 */
driverRouter.patch(
  "/:id/reactivate",
  authenticateAccess,
  authorizeRole(ROLES.ADMIN),
  reactivateDriver
);

/**
 * PATCH /api/drivers/availability
 * Set online/offline (driver)
 */
driverRouter.patch(
  "/availability",
  authenticateAccess,
  authorizeRole(ROLES.DRIVER),
  setAvailability
);

/**
 * GET /api/drivers/earnings
 * View earnings history (driver)
 */
driverRouter.get(
  "/earnings",
  authenticateAccess,
  authorizeRole(ROLES.DRIVER),
  earningsHistory
);

/**
 * GET /api/drivers/available-rides
 * List pending ride requests (driver)
 */
driverRouter.get(
  "/available-rides",
  authenticateAccess,
  authorizeRole(ROLES.DRIVER),
  availableRides
);
/**
 * GET /api/drivers/current-rides
 * List pending ride requests (driver)
 */
driverRouter.get(
  "/current-ride",
  authenticateAccess,
  authorizeRole(ROLES.DRIVER),
  getCurrentRide
);

// ✅ New: Driver updates vehicle details
driverRouter.patch(
  "/vehicle",
  authenticateAccess,
  authorizeRole(ROLES.DRIVER),
  updateVehicleDetails
);

// ✅ New: Driver get vehicle details
driverRouter.get(
  "/vehicle",
  authenticateAccess,
  authorizeRole(ROLES.DRIVER),
  getVehicleDetails
);

/**
 * GET /api/drivers/availability
 * Get current driver's availability status
 */
driverRouter.get(
  "/availability",
  authenticateAccess,
  authorizeRole(ROLES.DRIVER),
  getAvailability
);

// import { Router } from "express";
// import { ROLES } from "../../config/constants";
// import { authenticateAccess } from "../../middlewares/auth.middleware";
// import { authorizeRole } from "../../middlewares/role.middleware";
// import {
//   acceptRideByDriver,
//   approveDriver,
//   availableRides,
//   driverRideHistory,
//   earningsHistory,
//   getAvailability,
//   getCurrentRide,
//   getVehicleDetails,
//   listDrivers,
//   reactivateDriver,
//   setAvailability,
//   suspendDriver,
//   updateOwnRideStatus,
//   updateVehicleDetails,
// } from "./driver.controller";

// export const driverRouter = Router();

// /* ===== Admin Driver Management ===== */
// driverRouter.get(
//   "/",
//   authenticateAccess,
//   authorizeRole(ROLES.ADMIN),
//   listDrivers
// );
// driverRouter.patch(
//   "/:id/approve",
//   authenticateAccess,
//   authorizeRole(ROLES.ADMIN),
//   approveDriver
// );
// driverRouter.patch(
//   "/:id/suspend",
//   authenticateAccess,
//   authorizeRole(ROLES.ADMIN),
//   suspendDriver
// );
// driverRouter.patch(
//   "/:id/reactivate",
//   authenticateAccess,
//   authorizeRole(ROLES.ADMIN),
//   reactivateDriver
// );

// /* ===== Availability ===== */
// driverRouter.get(
//   "/availability",
//   authenticateAccess,
//   authorizeRole(ROLES.DRIVER),
//   getAvailability
// );
// driverRouter.patch(
//   "/availability",
//   authenticateAccess,
//   authorizeRole(ROLES.DRIVER),
//   setAvailability
// );

// /* ===== Rides (Driver Scoped) ===== */
// driverRouter.get(
//   "/rides/available",
//   authenticateAccess,
//   authorizeRole(ROLES.DRIVER),
//   availableRides
// );
// driverRouter.get(
//   "/rides/current",
//   authenticateAccess,
//   authorizeRole(ROLES.DRIVER),
//   getCurrentRide
// );
// driverRouter.get(
//   "/rides/history",
//   authenticateAccess,
//   authorizeRole(ROLES.DRIVER),
//   driverRideHistory
// );
// driverRouter.patch(
//   "/rides/:rideId/accept",
//   authenticateAccess,
//   authorizeRole(ROLES.DRIVER),
//   acceptRideByDriver
// );
// driverRouter.patch(
//   "/rides/:rideId/status",
//   authenticateAccess,
//   authorizeRole(ROLES.DRIVER),
//   updateOwnRideStatus
// );

// /* ===== Vehicle ===== */
// driverRouter.get(
//   "/vehicle",
//   authenticateAccess,
//   authorizeRole(ROLES.DRIVER),
//   getVehicleDetails
// );
// driverRouter.patch(
//   "/vehicle",
//   authenticateAccess,
//   authorizeRole(ROLES.DRIVER),
//   updateVehicleDetails
// );

// /* ===== Earnings ===== */
// driverRouter.get(
//   "/earnings",
//   authenticateAccess,
//   authorizeRole(ROLES.DRIVER),
//   earningsHistory
// );
