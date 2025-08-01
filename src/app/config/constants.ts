export const ROLES = {
  ADMIN: "admin",
  RIDER: "rider",
  DRIVER: "driver",
} as const;

export const RIDE_STATUS = [
  "requested",
  "accepted",
  "picked_up",
  "in_transit",
  "completed",
  "canceled",
] as const;
