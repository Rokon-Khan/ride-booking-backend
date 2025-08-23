import mongoose, { Schema } from "mongoose";
import { ROLES } from "../../config/constants";
import { IUser } from "./user.interface";

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: Object.values(ROLES) },
  status: { type: String, default: "active" },
  profile: {
    name: { type: String, required: true },
    phone: { type: String },
  },
});

export const User = mongoose.model<IUser>("User", UserSchema);

export { IUser };
