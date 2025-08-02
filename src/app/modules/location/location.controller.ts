import { Request, Response } from "express";
import { Driver } from "../driver/driver.model";

// Ensure Driver model has a 'location' field with { type: "Point", coordinates: [lng, lat] }
// and a 2dsphere index on it for geospatial queries.

export const nearbyDrivers = async (req: Request, res: Response) => {
  try {
    const { lat, lng, maxDistance } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ message: "lat and lng are required query parameters." });
    }

    // Default search radius: 3km (meters)
    const distance = maxDistance ? Number(maxDistance) : 3000;

    // Find available, approved, non-suspended drivers near the location
    const drivers = await Driver.find({
      available: true,
      approved: true,
      suspended: false,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: distance,
        },
      },
    }).limit(10); // limit to 10 for response size

    res.json({ drivers });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
