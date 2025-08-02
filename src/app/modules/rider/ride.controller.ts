import { Response } from "express";
import { Driver } from "../driver/driver.model";
import { Ride } from "./ride.model";
// import { User } from "../user/user.model";
import mongoose from "mongoose";
import { RIDE_STATUS, ROLES } from "../../config/constants";

// Helper: Only one active ride per rider
const ACTIVE_RIDE_STATUSES = [
  "requested",
  "accepted",
  "picked_up",
  "in_transit",
];

// Rider Endpoints
export const requestRide = async (req: any, res: Response) => {
  try {
    const { userId, status } = req.user;
    if (status !== "active")
      return res.status(403).json({ message: "Account is blocked." });

    // Check for existing active ride
    const activeRide = await Ride.findOne({
      rider: userId,
      status: { $in: ACTIVE_RIDE_STATUSES },
    });
    if (activeRide) {
      return res
        .status(400)
        .json({ message: "You already have an active ride." });
    }

    // Check if any available drivers exist
    const availableDriver = await Driver.findOne({
      available: true,
      approved: true,
      suspended: false,
    });
    if (!availableDriver) {
      return res
        .status(503)
        .json({ message: "No drivers available. Please try again later." });
    }

    // Create ride request
    const { pickup, destination } = req.body;
    if (!pickup || !destination)
      return res
        .status(400)
        .json({ message: "Pickup and destination are required." });

    const ride = await Ride.create({
      rider: userId,
      pickup,
      destination,
      status: "requested",
      timestamps: { requested: new Date() },
    });
    res.status(201).json({ rideId: ride._id, status: ride.status });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelRide = async (req: any, res: Response) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const ride = await Ride.findById(id);
    if (!ride) return res.status(404).json({ message: "Ride not found." });
    if (String(ride.rider) !== String(userId))
      return res.status(403).json({ message: "Unauthorized." });

    if (ride.status !== "requested") {
      return res
        .status(403)
        .json({
          message: "Ride cannot be canceled after driver has accepted.",
        });
    }
    ride.status = "canceled";
    ride.timestamps.canceled = new Date();
    await ride.save();
    res.json({ message: "Ride canceled." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const rideHistory = async (req: any, res: Response) => {
  try {
    const { userId } = req.user;
    const rides = await Ride.find({
      rider: userId,
      status: { $in: ["completed", "canceled"] },
    }).sort({ "timestamps.completed": -1 });
    res.json({ rides });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const currentRide = async (req: any, res: Response) => {
  try {
    const { userId, role } = req.user;
    let ride;
    if (role === ROLES.RIDER) {
      ride = await Ride.findOne({
        rider: userId,
        status: { $in: ACTIVE_RIDE_STATUSES },
      });
    } else if (role === ROLES.DRIVER) {
      ride = await Ride.findOne({
        driver: userId,
        status: { $in: ACTIVE_RIDE_STATUSES },
      });
    }
    if (!ride)
      return res.status(404).json({ message: "No active ride found." });
    res.json({ ride });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const viewRide = async (req: any, res: Response) => {
  try {
    const { userId, role } = req.user;
    const { id } = req.params;
    const ride = await Ride.findById(id);
    if (!ride) return res.status(404).json({ message: "Ride not found." });

    if (
      role === ROLES.ADMIN ||
      String(ride.rider) === String(userId) ||
      String(ride.driver) === String(userId)
    ) {
      res.json({ ride });
    } else {
      res.status(403).json({ message: "Unauthorized" });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Driver Endpoints
export const acceptRide = async (req: any, res: Response) => {
  try {
    const { userId } = req.user;
    const driver = await Driver.findOne({ user: userId });

    if (!driver || driver.suspended)
      return res
        .status(403)
        .json({ message: "Driver not found or suspended." });
    if (!driver.approved)
      return res.status(403).json({ message: "Driver not approved by admin." });
    if (!driver.available)
      return res
        .status(403)
        .json({ message: "Set yourself as available to accept rides." });

    // Only one active ride per driver
    const activeRide = await Ride.findOne({
      driver: driver._id,
      status: { $in: ACTIVE_RIDE_STATUSES },
    });
    if (activeRide)
      return res
        .status(400)
        .json({ message: "You already have an active ride." });

    const { id } = req.params;
    // Find ride and lock it for update (simulate with findOneAndUpdate)
    const ride = await Ride.findOneAndUpdate(
      { _id: id, status: "requested", driver: null },
      {
        $set: {
          driver: driver._id,
          status: "accepted",
          "timestamps.accepted": new Date(),
        },
      },
      { new: true }
    );
    if (!ride)
      return res
        .status(400)
        .json({ message: "Ride already taken or invalid." });

    // Mark driver as unavailable until ride completes
    driver.available = false;
    await driver.save();

    res.json({ message: "Ride accepted.", ride });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectRide = async (req: any, res: Response) => {
  try {
    const { userId } = req.user;
    const driver = await Driver.findOne({ user: userId });
    if (!driver) return res.status(403).json({ message: "Driver not found." });

    const { id } = req.params;
    const ride = await Ride.findById(id);
    if (!ride) return res.status(404).json({ message: "Ride not found." });

    if (
      ride.status !== "accepted" ||
      String(ride.driver) !== String(driver._id)
    ) {
      return res.status(400).json({ message: "Cannot reject this ride." });
    }

    // Set ride status back to requested, remove driver
    ride.status = "requested";
    ride.driver = undefined;
    ride.timestamps.accepted = undefined;
    await ride.save();

    // Driver can go available again
    driver.available = true;
    await driver.save();

    res.json({ message: "Ride rejected and available for other drivers." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRideStatus = async (req: any, res: Response) => {
  try {
    const { userId, role } = req.user;
    const { id } = req.params;
    const { status } = req.body;
    const ride = await Ride.findById(id);
    if (!ride) return res.status(404).json({ message: "Ride not found." });

    // Only driver assigned to this ride or admin can update
    if (
      role !== ROLES.ADMIN &&
      (!ride.driver || String(ride.driver) !== String(userId))
    ) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    // Allowed transitions
    const allowedTransitions: Record<string, string[]> = {
      accepted: ["picked_up"],
      picked_up: ["in_transit"],
      in_transit: ["completed"],
    };

    if (role !== ROLES.ADMIN) {
      if (!allowedTransitions[ride.status]?.includes(status)) {
        return res.status(403).json({ message: "Invalid status transition." });
      }
    }

    ride.status = status;
    ride.timestamps[status as keyof typeof ride.timestamps] = new Date();

    // If completed, calculate fare and set driver available again
    if (status === "completed") {
      // Dummy fare logic (can be improved)
      ride.fare = ride.fare || Math.floor(Math.random() * 100) + 50;
      const driver = await Driver.findById(ride.driver);
      if (driver) {
        driver.available = true;
        driver.earnings += ride.fare;
        await driver.save();
      }
    }

    await ride.save();
    res.json({ message: "Ride status updated.", ride });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const driverCurrentRide = async (req: any, res: Response) => {
  try {
    const { userId } = req.user;
    const driver = await Driver.findOne({ user: userId });
    if (!driver) return res.status(403).json({ message: "Driver not found." });

    const ride = await Ride.findOne({
      driver: driver._id,
      status: { $in: ACTIVE_RIDE_STATUSES },
    });
    if (!ride)
      return res.status(404).json({ message: "No active ride found." });
    res.json({ ride });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const driverHistory = async (req: any, res: Response) => {
  try {
    const { userId } = req.user;
    const driver = await Driver.findOne({ user: userId });
    if (!driver) return res.status(403).json({ message: "Driver not found." });

    const rides = await Ride.find({
      driver: driver._id,
      status: "completed",
    }).sort({ "timestamps.completed": -1 });
    res.json({ rides });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Admin Endpoints
export const adminListRides = async (req: any, res: Response) => {
  try {
    // Filters: status, date, user, driver, pagination
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.rider)
      filter.rider = new mongoose.Types.ObjectId(req.query.rider);
    if (req.query.driver)
      filter.driver = new mongoose.Types.ObjectId(req.query.driver);

    // Date filter
    if (req.query.start || req.query.end) {
      filter["timestamps.requested"] = {};
      if (req.query.start)
        filter["timestamps.requested"].$gte = new Date(req.query.start);
      if (req.query.end)
        filter["timestamps.requested"].$lte = new Date(req.query.end);
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const rides = await Ride.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ "timestamps.requested": -1 });

    res.json({ rides, page, limit });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const adminViewRide = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await Ride.findById(id);
    if (!ride) return res.status(404).json({ message: "Ride not found." });
    res.json({ ride });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const adminUpdateStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ride = await Ride.findById(id);
    if (!ride) return res.status(404).json({ message: "Ride not found." });

    // Admin can forcibly update status (log timestamp)
    if (!RIDE_STATUS.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    ride.status = status;
    ride.timestamps[status as keyof typeof ride.timestamps] = new Date();

    if (status === "completed") {
      ride.fare = ride.fare || Math.floor(Math.random() * 100) + 50;
      const driver = await Driver.findById(ride.driver);
      if (driver) {
        driver.available = true;
        driver.earnings += ride.fare;
        await driver.save();
      }
    }
    await ride.save();
    res.json({ message: "Ride status updated by admin.", ride });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const adminDeleteRide = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await Ride.findById(id);
    if (!ride) return res.status(404).json({ message: "Ride not found." });
    if (ride.status !== "requested")
      return res
        .status(403)
        .json({ message: "Only unaccepted ride requests can be deleted." });

    await Ride.deleteOne({ _id: id });
    res.json({ message: "Ride deleted." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
