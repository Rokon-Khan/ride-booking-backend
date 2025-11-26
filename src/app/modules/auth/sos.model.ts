import mongoose, { Schema } from "mongoose";

export interface SOSDocument extends mongoose.Document {
  rider?: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  ride: mongoose.Types.ObjectId;
  location?: {
    lat: number;
    lng: number;
  };
  message?: string;
  timestamp: Date;
}

const SOSSchema = new Schema({
  rider: { type: Schema.Types.ObjectId, ref: "User" },
  driver: { type: Schema.Types.ObjectId, ref: "User" },
  ride: { type: Schema.Types.ObjectId, ref: "Ride", required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  message: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const SOS = mongoose.model<SOSDocument>("SOS", SOSSchema);