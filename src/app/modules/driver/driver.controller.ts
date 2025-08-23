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

export const earningsHistory = async (req: any, res: Response) => {
  // Sum up completed rides' fares for this driver
  const rides = await Ride.find({
    driver: req.user.userId,
    status: "completed",
  });
  const total = rides.reduce((sum, r) => sum + (r.fare || 0), 0);
  res.json({ total, rides });
};

export const availableRides = async (req: any, res: Response) => {
  // List rides with status "requested" and no driver assigned
  const rides = await Ride.find({ status: "requested", driver: null });
  res.json(rides);
};
