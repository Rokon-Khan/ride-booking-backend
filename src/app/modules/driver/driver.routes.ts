// import { Router } from "express";
// import { ROLES } from "../../config/constants";
// import { authenticateJWT } from "../../middlewares/authenticateJWT";
// import { authorizeRole } from "../../middlewares/authorizeRole";
// import {
//   approveDriver,
//   availableRides,
//   earningsHistory,
//   listDrivers,
//   reactivateDriver,
//   setAvailability,
//   suspendDriver,
// } from "./driver.controller";

// export const driverRouter = Router();

// /**
//  * GET /api/drivers
//  * List all drivers (admin)
//  */
// driverRouter.get(
//   "/",
//   authenticateJWT,
//   authorizeRole([ROLES.ADMIN]),
//   listDrivers
// );

// /**
//  * PATCH /api/drivers/:id/approve
//  * Approve driver (admin)
//  */
// driverRouter.patch(
//   "/:id/approve",
//   authenticateJWT,
//   authorizeRole([ROLES.ADMIN]),
//   approveDriver
// );

// /**
//  * PATCH /api/drivers/:id/suspend
//  * Suspend driver (admin)
//  */
// driverRouter.patch(
//   "/:id/suspend",
//   authenticateJWT,
//   authorizeRole([ROLES.ADMIN]),
//   suspendDriver
// );

// /**
//  * PATCH /api/drivers/:id/reactivate
//  * Reactivate driver (admin)
//  */
// driverRouter.patch(
//   "/:id/reactivate",
//   authenticateJWT,
//   authorizeRole([ROLES.ADMIN]),
//   reactivateDriver
// );

// /**
//  * PATCH /api/drivers/availability
//  * Set online/offline (driver)
//  */
// driverRouter.patch(
//   "/availability",
//   authenticateJWT,
//   authorizeRole([ROLES.DRIVER]),
//   setAvailability
// );

// /**
//  * GET /api/drivers/earnings
//  * View earnings history (driver)
//  */
// driverRouter.get(
//   "/earnings",
//   authenticateJWT,
//   authorizeRole([ROLES.DRIVER]),
//   earningsHistory
// );

// /**
//  * GET /api/drivers/available-rides
//  * List pending ride requests (driver)
//  */
// driverRouter.get(
//   "/available-rides",
//   authenticateJWT,
//   authorizeRole([ROLES.DRIVER]),
//   availableRides
// );

import { Router } from "express";
import { ROLES } from "../../config/constants";
import { authenticateAccess } from "../../middlewares/auth.middleware";
import { authorizeRole } from "../../middlewares/role.middleware";
import {
  approveDriver,
  availableRides,
  earningsHistory,
  listDrivers,
  reactivateDriver,
  setAvailability,
  suspendDriver,
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
