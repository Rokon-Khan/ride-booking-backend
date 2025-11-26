import { IDriver } from "../driver/driver.interface";
import { IUser } from "../user/user.interface";

export interface RideDocument extends Document {
  rider: IUser["_id"];
  driver?: IDriver["_id"];
  pickup: { lat?: number; lng: number; address: string };
  destination: { lat?: number; lng: number; address: string };
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
