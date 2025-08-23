// import { NextFunction, Request, Response } from "express";
// import { verifyToken } from "../config/jwt";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         [x: string]: string;
//         sub: string;
//       };
//     }
//   }
// }

// export function authenticateAccess(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   const header = req.headers.authorization;
//   if (!header?.startsWith("Bearer "))
//     return res.status(401).json({ error: "Unauthorized" });
//   const token = header.split(" ")[1];
//   try {
//     const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET!);
//     if (payload.type !== "access")
//       return res.status(401).json({ error: "Invalid token type" });
//     req.user = { sub: payload.sub };
//     next();
//   } catch {
//     return res.status(401).json({ error: "Invalid or expired token" });
//   }
// }

import { NextFunction, Request, Response } from "express";
import { JwtPayloadBase, verifyToken } from "../config/jwt";

declare global {
  namespace Express {
    interface UserJWT {
      sub: string;
      userId: string; // alias for convenience
      role: "admin" | "driver" | "rider";
      tokenVersion?: number;
    }
    interface Request {
      user?: UserJWT;
    }
  }
}

export function authenticateAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.slice(7).trim(); // remove "Bearer "
  try {
    const payload = verifyToken<JwtPayloadBase>(
      token,
      process.env.JWT_ACCESS_SECRET!
    );
    if (payload.type !== "access") {
      return res.status(401).json({ error: "Invalid token type" });
    }

    // ✅ attach everything your app needs downstream
    req.user = {
      sub: payload.sub,
      userId: payload.sub, // keep old code working
      role: payload.role as any, // "admin" | "driver" | "rider"
      tokenVersion: payload.tokenVersion,
    };

    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
