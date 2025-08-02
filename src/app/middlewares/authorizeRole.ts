import { NextFunction, Response } from "express";
import { AuthRequest } from "./authenticateJWT";

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Unauthorized role" });
    }
    next();
  };
};
