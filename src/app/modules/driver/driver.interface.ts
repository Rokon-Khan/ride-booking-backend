import { Types } from "mongoose";

export interface DriverDocument extends Document {
  user: Types.ObjectId;
  approved: boolean;
  suspended: boolean;
  available: boolean;
  vehicle: {
    model: string;
    licensePlate: string;
  };
  earnings: number;
}
