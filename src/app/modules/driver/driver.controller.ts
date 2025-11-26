import { Request, Response } from "express";
import { Ride } from "../rider/ride.model";
import { Driver } from "./driver.model";
// import { User } from "../user/user.model";

export const listDrivers = async (req: Request, res: Response) => {
  const drivers = await Driver.find({});
  res.json({
    success: true,
    message: "Drivers retrieved successfully",
    data: drivers,
  });
};

export const approveDriver = async (req: Request, res: Response) => {
  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    { approved: true },
    { new: true }
  );
  if (!driver) return res.status(400).json({ message: "Driver not found" });
  res.json({ message: "Driver approved", driver });
};

export const suspendDriver = async (req: Request, res: Response) => {
  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    { suspended: true },
    { new: true }
  );
  if (!driver) return res.status(400).json({ message: "Driver not found" });
  res.json({ message: "Driver suspended", driver });
};

export const reactivateDriver = async (req: Request, res: Response) => {
  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    { suspended: false },
    { new: true }
  );
  if (!driver) return res.status(400).json({ message: "Driver not found" });
  res.json({ message: "Driver reactivated", driver });
};

export const setAvailability = async (req: any, res: Response) => {
  const { available } = req.body;
  const driver = await Driver.findOneAndUpdate(
    { user: req.user.userId },
    { available },
    { new: true }
  );
  if (!driver)
    return res.status(403).json({ message: "Driver not found or suspended" });
  res.json({ message: "Availability updated", driver });
};

// ✅ NEW: Get current authenticated driver's availability
export const getAvailability = async (req: any, res: Response) => {
  const driver = await Driver.findOne({ user: req.user.userId }).select(
    "available"
  );
  if (!driver) {
    return res.status(404).json({ message: "Driver not found" });
  }
  // Keep it minimal & consistent
  res.json({ available: driver.available });
};

// Driver Earning History
// export const earningsHistory = async (req: any, res: Response) => {
//   // Sum up completed rides' fares for this driver
//   const rides = await Ride.find({
//     driver: req.user.userId,
//     status: "completed",
//   });
//   const total = rides.reduce((sum, r) => sum + (r.fare || 0), 0);
//   res.json({ total, rides });
// };

// Driver Earning History

export const earningsHistory = async (req: any, res: Response) => {
  try {
    const { userId, role } = req.user;

    if (role !== "driver") {
      return res
        .status(403)
        .json({ message: "Only drivers can view earnings" });
    }

    // Find the Driver record linked to this user
    const driver = await Driver.findOne({ user: userId });
    if (!driver) {
      return res.json({ total: 0, rides: [] });
    }

    // Fetch completed rides for this driver
    const rides = await Ride.find({
      driver: driver._id,
      status: "completed",
    });

    // Sum up fares
    const total = rides.reduce((sum, r) => sum + (r.fare || 0), 0);

    res.json({ total, rides });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const availableRides = async (req: any, res: Response) => {
  // List rides with status "requested" and no driver assigned
  const rides = await Ride.find({ status: "requested", driver: null });
  res.json(rides);
};

// ✅ New: Update vehicle details (driver only)
export const updateVehicleDetails = async (req: any, res: Response) => {
  const { model, licensePlate } = req.body;

  if (!model && !licensePlate) {
    return res.status(400).json({
      message: "Please provide vehicle.model or vehicle.licensePlate",
    });
  }

  const updateFields: any = {};
  if (model) updateFields["vehicle.model"] = model;
  if (licensePlate) updateFields["vehicle.licensePlate"] = licensePlate;

  const driver = await Driver.findOneAndUpdate(
    { user: req.user.userId }, // only update the authenticated driver's info
    { $set: updateFields },
    { new: true }
  );

  if (!driver) {
    return res.status(404).json({ message: "Driver not found" });
  }

  res.json({
    success: true,
    message: "Vehicle details updated successfully",
    driver,
  });
};

// ✅ Get vehicle details (driver only)
export const getVehicleDetails = async (req: any, res: Response) => {
  const driver = await Driver.findOne({ user: req.user.userId }).select(
    "vehicle"
  );

  if (!driver) {
    return res.status(404).json({ message: "Driver not found" });
  }

  res.json({
    success: true,
    message: "Vehicle details retrieved successfully",
    vehicle: driver.vehicle,
  });
};

/**
 * Current active ride for this driver (not completed/canceled)
 * We consider active any of: accepted, picked_up, in_transit
 */
export const getCurrentRide = async (req: any, res: Response) => {
  const userId = req.user.userId;
  const active = await Ride.findOne({
    driver: userId,
    status: { $in: ["accepted", "picked_up", "in_transit"] },
  })
    .sort({ "timestamps.accepted": -1 })
    .lean();
  res.json({
    success: true,
    data: active || null,
  });
};

// import { Request, Response } from "express";
// import { Ride } from "../rider/ride.model";
// import { Driver } from "./driver.model";

// /**
//  * Utility: consistent JSON error
//  */
// const respondError = (res: Response, status: number, message: string) =>
//   res.status(status).json({ success: false, message });

// /**
//  * Utility: ensure driver exists and not suspended (and optionally approved if you enforce that)
//  */
// const findActiveDriver = async (userId: string) => {
//   return Driver.findOne({ user: userId, suspended: { $ne: true } });
// };

// /**
//  * ADMIN: list all drivers
//  */
// export const listDrivers = async (_req: Request, res: Response) => {
//   const drivers = await Driver.find({});
//   res.json({
//     success: true,
//     message: "Drivers retrieved successfully",
//     data: drivers,
//   });
// };

// export const approveDriver = async (req: Request, res: Response) => {
//   const driver = await Driver.findByIdAndUpdate(
//     req.params.id,
//     { approved: true },
//     { new: true }
//   );
//   if (!driver) return respondError(res, 400, "Driver not found");
//   res.json({ success: true, message: "Driver approved", data: driver });
// };

// export const suspendDriver = async (req: Request, res: Response) => {
//   const driver = await Driver.findByIdAndUpdate(
//     req.params.id,
//     { suspended: true },
//     { new: true }
//   );
//   if (!driver) return respondError(res, 400, "Driver not found");
//   res.json({ success: true, message: "Driver suspended", data: driver });
// };

// export const reactivateDriver = async (req: Request, res: Response) => {
//   const driver = await Driver.findByIdAndUpdate(
//     req.params.id,
//     { suspended: false },
//     { new: true }
//   );
//   if (!driver) return respondError(res, 400, "Driver not found");
//   res.json({ success: true, message: "Driver reactivated", data: driver });
// };

// /**
//  * Driver availability
//  */
// export const setAvailability = async (req: any, res: Response) => {
//   const { available } = req.body;
//   if (typeof available !== "boolean") {
//     return respondError(res, 400, "available must be boolean");
//   }
//   const driver = await Driver.findOneAndUpdate(
//     { user: req.user.userId },
//     { available },
//     { new: true }
//   );
//   if (!driver) return respondError(res, 403, "Driver not found or suspended");
//   res.json({
//     success: true,
//     message: "Availability updated",
//     data: { available: driver.available },
//   });
// };

// export const getAvailability = async (req: any, res: Response) => {
//   const driver = await Driver.findOne({ user: req.user.userId }).select(
//     "available"
//   );
//   if (!driver) return respondError(res, 404, "Driver not found");
//   res.json({ success: true, data: { available: driver.available } });
// };

// /**
//  * Earnings (aggregate of completed rides)
//  */
// export const earningsHistory = async (req: any, res: Response) => {
//   const rides = await Ride.find({
//     driver: req.user.userId,
//     status: "completed",
//   }).sort({ "timestamps.completed": -1 });
//   const total = rides.reduce((sum, r) => sum + (r.fare || 0), 0);
//   res.json({
//     success: true,
//     message: "Earnings retrieved",
//     data: { total, rides },
//   });
// };

// /**
//  * Unassigned rides with status "requested"
//  */
// export const availableRides = async (_req: any, res: Response) => {
//   const rides = await Ride.find({
//     status: "requested",
//     driver: null,
//   }).sort({ "timestamps.requested": -1 });
//   res.json({ success: true, message: "Available rides", data: rides });
// };

// /**
//  * Accept a ride:
//  * - Only if ride.status=requested and no driver
//  * - Atomic: use conditions in findOneAndUpdate to prevent race acceptance
//  */
// export const acceptRideByDriver = async (req: any, res: Response) => {
//   const userId = req.user.userId;
//   const rideId = req.params.rideId;

//   const driver = await findActiveDriver(userId);
//   if (!driver) return respondError(res, 403, "Driver not found or suspended");

//   // Optional: require driver.available === true
//   if (!driver.available) {
//     return respondError(res, 409, "Set yourself online before accepting rides");
//   }

//   const now = new Date();

//   // optimistic concurrency: ensure driver is still null and status is requested
//   const ride = await Ride.findOneAndUpdate(
//     {
//       _id: rideId,
//       status: "requested",
//       driver: null,
//     },
//     {
//       $set: {
//         driver: userId,
//         status: "accepted",
//         "timestamps.accepted": now,
//       },
//     },
//     { new: true }
//   );

//   if (!ride) {
//     return respondError(
//       res,
//       409,
//       "Ride already accepted or not in requested state"
//     );
//   }

//   res.json({
//     success: true,
//     message: "Ride accepted",
//     data: ride,
//   });
// };

// /**
//  * Driver updates status of OWN ride.
//  * Allowed transitions (one-way):
//  * accepted -> picked_up
//  * picked_up -> in_transit
//  * in_transit -> completed
//  * accepted|picked_up|in_transit -> canceled (optional emergency)
//  */
// const allowedTransitions: Record<string, string[]> = {
//   accepted: ["picked_up", "canceled"],
//   picked_up: ["in_transit", "canceled"],
//   in_transit: ["completed", "canceled"],
// };

// export const updateOwnRideStatus = async (req: any, res: Response) => {
//   const userId = req.user.userId;
//   const rideId = req.params.rideId;
//   const { status } = req.body as { status?: string };

//   if (!status) return respondError(res, 400, "status field is required");

//   const ride = await Ride.findById(rideId);
//   if (!ride) return respondError(res, 404, "Ride not found");

//   if (String(ride.driver) !== String(userId)) {
//     return respondError(res, 403, "You are not assigned to this ride");
//   }

//   if (ride.status === status) {
//     return respondError(res, 409, "Ride is already in that status");
//   }

//   const nextAllowed = allowedTransitions[ride.status] || [];
//   if (!nextAllowed.includes(status)) {
//     return respondError(
//       res,
//       400,
//       `Invalid transition from ${ride.status} to ${status}`
//     );
//   }

//   const now = new Date();

//   // Set status & timestamp
//   ride.status = status as any;
//   (ride.timestamps as any)[status] = now;

//   // Optional: auto-set completion fare logic could go here.
//   await ride.save();

//   res.json({
//     success: true,
//     message: `Ride status updated to ${status}`,
//     data: ride,
//   });
// };

// /**
//  * Current active ride for this driver (not completed/canceled)
//  * We consider active any of: accepted, picked_up, in_transit
//  */
// export const getCurrentRide = async (req: any, res: Response) => {
//   const userId = req.user.userId;
//   const active = await Ride.findOne({
//     driver: userId,
//     status: { $in: ["accepted", "picked_up", "in_transit"] },
//   })
//     .sort({ "timestamps.accepted": -1 })
//     .lean();
//   res.json({
//     success: true,
//     data: active || null,
//   });
// };

// /**
//  * Driver ride history (all rides for the driver)
//  * (You can add pagination params if needed)
//  */
// export const driverRideHistory = async (req: any, res: Response) => {
//   const userId = req.user.userId;
//   const rides = await Ride.find({
//     driver: userId,
//   }).sort({ "timestamps.requested": -1 });
//   res.json({
//     success: true,
//     message: "Driver ride history",
//     data: rides,
//   });
// };

// /**
//  * Vehicle update & retrieval
//  */
// export const updateVehicleDetails = async (req: any, res: Response) => {
//   const { model, licensePlate } = req.body;

//   if (!model && !licensePlate) {
//     return respondError(
//       res,
//       400,
//       "Provide model and/or licensePlate to update"
//     );
//   }

//   const updateFields: any = {};
//   if (model) updateFields["vehicle.model"] = model;
//   if (licensePlate) updateFields["vehicle.licensePlate"] = licensePlate;

//   const driver = await Driver.findOneAndUpdate(
//     { user: req.user.userId },
//     { $set: updateFields },
//     { new: true }
//   );

//   if (!driver) return respondError(res, 404, "Driver not found");

//   res.json({
//     success: true,
//     message: "Vehicle details updated successfully",
//     data: driver.vehicle,
//   });
// };

// export const getVehicleDetails = async (req: any, res: Response) => {
//   const driver = await Driver.findOne({ user: req.user.userId }).select(
//     "vehicle"
//   );
//   if (!driver) return respondError(res, 404, "Driver not found");
//   res.json({
//     success: true,
//     message: "Vehicle details retrieved successfully",
//     data: driver.vehicle,
//   });
// };
