import { ROLES } from "../../config/constants";
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  otpVersion: number;
  tokenVersion: number;
  refreshTokens?: string[];
  role: (typeof ROLES)[keyof typeof ROLES];
  status: "active" | "blocked";
  profile: {
    name: string;
    phone?: string;
    avatarUrl?: string | null;
    address?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}
