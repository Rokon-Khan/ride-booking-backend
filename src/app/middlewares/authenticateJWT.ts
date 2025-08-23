import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../modules/user/user.interface";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload as any;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
