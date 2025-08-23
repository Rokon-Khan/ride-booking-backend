import mongoose, { Schema } from "mongoose";
import { ROLES } from "../../config/constants";
import { IUser } from "./user.interface";

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  role: { type: String, required: true, enum: Object.values(ROLES) },
  status: { type: String, default: "active" },
  tokenVersion: { type: Number, default: 0 },
  refreshTokens: [{ type: String }],
  profile: {
    name: { type: String, required: true },
    phone: { type: String },
    avatarUrl: { type: String, default: null },
    address: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>("User", UserSchema);

export { IUser };
