import { Types } from "mongoose";

export interface IDriver extends Document {
  _id: string;
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
