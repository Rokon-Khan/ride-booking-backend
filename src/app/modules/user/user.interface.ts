import { ROLES } from "../../config/constants";
export interface UserDocument extends Document {
  email: string;
  password: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  status: "active" | "blocked";
  profile: {
    name: string;
    phone?: string;
    [key: string]: any;
  };
}
