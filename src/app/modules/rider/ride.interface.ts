import { DriverDocument } from "../driver/driver.interface";
import { UserDocument } from "../user/user.interface";

export interface RideDocument extends Document {
  rider: UserDocument["_id"];
  driver?: DriverDocument["_id"];
  pickup: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  status: string;
  timestamps: {
    requested: Date;
    accepted?: Date;
    picked_up?: Date;
    in_transit?: Date;
    completed?: Date;
    canceled?: Date;
  };
  fare: number;
}
