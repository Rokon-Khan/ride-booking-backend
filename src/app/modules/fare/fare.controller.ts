import { Request, Response } from "express";

// Haversine formula to calculate distance between two points (lat/lng) in kilometers
function getDistanceFromLatLng(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const fareEstimate = async (req: Request, res: Response) => {
  try {
    const { pickup, destination } = req.body;

    if (
      !pickup ||
      !destination ||
      typeof pickup.lat !== "number" ||
      typeof pickup.lng !== "number" ||
      typeof destination.lat !== "number" ||
      typeof destination.lng !== "number"
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or missing coordinates." });
    }

    // Calculate distance in km
    const distanceKm = getDistanceFromLatLng(
      pickup.lat,
      pickup.lng,
      destination.lat,
      destination.lng
    );

    // Fare logic (base fare + per km rate)
    const BASE_FARE = 50; // e.g., 50 units
    const PER_KM_RATE = 20; // e.g., 20 units per km

    const estimatedFare = Math.round(BASE_FARE + distanceKm * PER_KM_RATE);

    res.json({
      estimatedFare,
      distanceKm: Number(distanceKm.toFixed(2)),
      currency: "BDT", // or your preferred currency code
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
