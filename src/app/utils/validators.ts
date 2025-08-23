import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  avatarUrl: z.string().url().optional().nullable(),
  phone: z.string().min(6).max(20).optional().nullable(),
  address: z.string().min(5).optional().nullable(),
});
// User Registration Validator
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["rider", "driver"]),
  profile: profileSchema,
});

// Login Validator
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
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

// OTP and Password Reset Validators
export const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

//OTP Resend Validators
export const resendOtpSchema = z.object({
  email: z.string().email(),
});

//Reset Password Validators
export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
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
export type OTPInput = z.infer<typeof otpSchema>;
export type ResendOTPInput = z.infer<typeof resendOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
