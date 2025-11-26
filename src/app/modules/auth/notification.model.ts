import mongoose, { Schema } from "mongoose";

export interface NotificationDocument extends mongoose.Document {
  type: "sos" | "general";
  title: string;
  message: string;
  riderName: string;
  riderEmail: string;
  rideId: mongoose.Types.ObjectId;
  location?: {
    lat: number;
    lng: number;
  };
  isRead: boolean;
  timestamp: Date;
}

const NotificationSchema = new Schema({
  type: { type: String, enum: ["sos", "general"], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  riderName: { type: String, required: true },
  riderEmail: { type: String, required: true },
  rideId: { type: Schema.Types.ObjectId, ref: "Ride", required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

export const Notification = mongoose.model<NotificationDocument>("Notification", NotificationSchema);