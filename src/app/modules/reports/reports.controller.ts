import { Request, Response } from "express";
import { Driver } from "../driver/driver.model";
import { Ride } from "../rider/ride.model";
import { User } from "../user/user.model";

// Rides stats: daily/monthly ride counts and total revenue
export const rideStats = async (req: Request, res: Response) => {
  try {
    // Group by day or month based on query param
    const groupBy =
      req.query.period === "month"
        ? { $dateToString: { format: "%Y-%m", date: "$timestamps.requested" } }
        : {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timestamps.requested",
            },
          };

    const stats = await Ride.aggregate([
      {
        $match: {
          status: "completed",
        },
      },
      {
        $group: {
          _id: groupBy,
          rideCount: { $sum: 1 },
          totalRevenue: { $sum: "$fare" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ stats, period: req.query.period || "day" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// User stats: active/blocked counts, daily signup trend
export const userStats = async (req: Request, res: Response) => {
  try {
    // Counts
    const [active, blocked] = await Promise.all([
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "blocked" }),
    ]);

    // Signup trends last 30 days
    const signups = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    res.json({ active, blocked, signups });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Driver stats: online count, completion rate, avg earnings
export const driverStats = async (req: Request, res: Response) => {
  try {
    // Online drivers
    const online = await Driver.countDocuments({
      available: true,
      suspended: false,
      approved: true,
    });

    // Completion rate and average earnings
    // Find all drivers with at least one completed ride
    const completionAgg = await Ride.aggregate([
      { $match: { driver: { $ne: null } } },
      {
        $group: {
          _id: "$driver",
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          total: { $sum: 1 },
          totalEarnings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$fare", 0] },
          },
        },
      },
      {
        $project: {
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $divide: ["$completed", "$total"] },
            ],
          },
          avgEarnings: {
            $cond: [
              { $eq: ["$completed", 0] },
              0,
              { $divide: ["$totalEarnings", "$completed"] },
            ],
          },
        },
      },
    ]);

    const completionRate =
      completionAgg.length > 0
        ? completionAgg.reduce((sum, d) => sum + d.completionRate, 0) /
          completionAgg.length
        : 0;
    const avgEarnings =
      completionAgg.length > 0
        ? completionAgg.reduce((sum, d) => sum + d.avgEarnings, 0) /
          completionAgg.length
        : 0;

    res.json({ online, avgEarnings, completionRate });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Earnings stats: total platform revenue, commission (assume 20% commission)
export const earningsStats = async (req: Request, res: Response) => {
  try {
    const completedRides = await Ride.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$fare" },
        },
      },
    ]);
    const totalRevenue = completedRides[0]?.totalRevenue || 0;
    const commissionRate = 0.2;
    const commission = totalRevenue * commissionRate;
    const driverPayout = totalRevenue - commission;

    res.json({
      totalRevenue,
      commission,
      driverPayout,
      commissionRate,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
