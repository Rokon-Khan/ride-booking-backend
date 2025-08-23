import { NextFunction, Request, Response } from "express";

type UserRole = "admin" | "driver" | "rider";

export function authorizeRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.user as { role?: UserRole })?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: "Forbidden: Unauthorized role" });
    }
    return next();
  };
}
