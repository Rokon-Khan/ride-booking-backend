import mongoose, { Schema } from "mongoose";
import { DriverDocument } from "./driver.interface";

const DriverSchema = new Schema<DriverDocument>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  approved: { type: Boolean, default: false },
  suspended: { type: Boolean, default: false },
  available: { type: Boolean, default: false },
  vehicle: {
    model: { type: String },
    licensePlate: { type: String },
  },
  earnings: { type: Number, default: 0 },
});

export const Driver = mongoose.model<DriverDocument>("Driver", DriverSchema);
