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

// import { NextFunction, Request, Response } from "express";
// import { JwtPayloadBase, verifyToken } from "../config/jwt";

// declare global {
//   namespace Express {
//     interface UserJWT {
//       sub: string;
//       userId: string; // alias for convenience
//       role: "admin" | "driver" | "rider";
//       tokenVersion?: number;
//     }
//     interface Request {
//       user?: UserJWT;
//     }
//   }
// }

// export function authenticateAccess(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   const header = req.headers.authorization;
//   if (!header || !header.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const token = header.slice(7).trim(); // remove "Bearer "
//   try {
//     const payload = verifyToken<JwtPayloadBase>(
//       token,
//       process.env.JWT_ACCESS_SECRET!
//     );
//     if (payload.type !== "access") {
//       return res.status(401).json({ error: "Invalid token type" });
//     }

//     // ✅ attach everything your app needs downstream
//     req.user = {
//       sub: payload.sub,
//       userId: payload.sub, // keep old code working
//       role: payload.role as any, // "admin" | "driver" | "rider"
//       tokenVersion: payload.tokenVersion,
//     };

//     return next();
//   } catch {
//     return res.status(401).json({ error: "Invalid or expired token" });
//   }
// }

import { NextFunction, Request, Response } from "express";
import { JwtPayloadBase, verifyToken } from "../config/jwt";
import { User } from "../modules/user/user.model";
// import { User } from "../user/user.model"; // <--- 1. IMPORT YOUR USER MODEL

declare global {
  namespace Express {
    // 2. MAKE THIS TYPE MORE USEFUL: IT SHOULD REPRESENT THE FRESH USER DATA
    interface UserJWT {
      _id: string; // Use _id for consistency with Mongoose
      userId: string; // Alias for convenience
      role: "admin" | "driver" | "rider";
      status: "active" | "blocked"; // <-- Add the status field!
      tokenVersion: number;
    }
    interface Request {
      user?: UserJWT;
    }
  }
}

// 3. MAKE THE FUNCTION ASYNC TO AWAIT THE DATABASE CALL
export async function authenticateAccess(
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

    // 4. FETCH THE FRESH USER FROM THE DATABASE
    const freshUser = await User.findById(payload.sub).lean(); // .lean() is faster for reads

    // 5. PERFORM CRITICAL VALIDATION
    if (!freshUser) {
      return res.status(401).json({ error: "User not found" });
    }

    // This check invalidates old tokens if the password was reset or user was blocked/unblocked
    if (freshUser.tokenVersion !== payload.tokenVersion) {
      return res
        .status(401)
        .json({ error: "Session has expired, please log in again" });
    }

    // 6. ATTACH THE FRESH, TRUSTED USER DATA TO THE REQUEST
    req.user = {
      _id: freshUser._id.toString(),
      userId: freshUser._id.toString(),
      role: freshUser.role as any,
      status: freshUser.status as any, // <-- NOW THE CORRECT STATUS IS AVAILABLE
      tokenVersion: freshUser.tokenVersion,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
