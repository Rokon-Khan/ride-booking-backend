import mongoose, { Schema } from "mongoose";
import { RideDocument } from "./ride.interface";

const RideSchema = new Schema({
  rider: { type: Schema.Types.ObjectId, ref: "User", required: true },
  driver: { type: Schema.Types.ObjectId, ref: "Driver" },
  pickup: {
    lat: Number,
    lng: Number,
    address: String,
    required: true,
  },
  destination: {
    lat: Number,
    lng: Number,
    address: String,
    required: true,
  },
  status: { type: String, required: true },
  timestamps: {
    requested: { type: Date, default: Date.now },
    accepted: Date,
    picked_up: Date,
    in_transit: Date,
    completed: Date,
    canceled: Date,
  },
  fare: { type: Number, default: 0 },
});

export const Ride = mongoose.model<RideDocument>("Ride", RideSchema);
