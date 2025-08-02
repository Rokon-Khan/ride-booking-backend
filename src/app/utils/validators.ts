import { z } from "zod";

// User Registration Validator
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["rider", "driver"]),
  profile: z.object({
    name: z.string().min(2),
    phone: z.string().optional(),
  }),
});

// Login Validator
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Ride Request Validator
export const rideRequestSchema = z.object({
  pickup: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }),
});

// Set Availability Validator
export const availabilitySchema = z.object({
  available: z.boolean(),
});

// Fare Estimate Validator
export const fareEstimateSchema = z.object({
  pickup: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

// Ride Status Update Validator
export const rideStatusSchema = z.object({
  status: z.enum([
    "accepted",
    "picked_up",
    "in_transit",
    "completed",
    "canceled",
  ]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RideRequestInput = z.infer<typeof rideRequestSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type FareEstimateInput = z.infer<typeof fareEstimateSchema>;
export type RideStatusInput = z.infer<typeof rideStatusSchema>;
