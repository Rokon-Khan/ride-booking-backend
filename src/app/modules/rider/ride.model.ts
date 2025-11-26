import mongoose, { Schema } from "mongoose";
import { RideDocument } from "./ride.interface";

const RideSchema = new Schema({
  rider: { type: Schema.Types.ObjectId, ref: "User", required: true },
  driver: { type: Schema.Types.ObjectId, ref: "Driver" },
  pickup: {
    type: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, required: true },
    },
    required: true, // Makes the entire pickup object required
  },
  destination: {
    type: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, required: true },
    },
    required: true, // Makes the entire destination object required
  },
  status: { type: String, required: true },
  timestamps: {
    requested: { type: Date, default: Date.now },
    accepted: { type: Date },
    picked_up: { type: Date },
    in_transit: { type: Date },
    completed: { type: Date },
    canceled: { type: Date },
  },
  fare: { type: Number, default: 0 },
});

export const Ride = mongoose.model<RideDocument>("Ride", RideSchema);
