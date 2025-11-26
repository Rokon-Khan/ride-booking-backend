import { Request, Response } from "express";
import { hashPassword } from "../../config/hash.password";
import {
  sendEmailVerification,
  sendPasswordResetOTP,
  sendSOSAlert,
} from "../../utils/email.service";
import { generateOTP } from "../../utils/generate.otp";
import {
  loginSchema,
  otpSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  troubleSchema,
} from "../../utils/validators";
import { Driver } from "../driver/driver.model";
import { storeOTP, verifyOTP } from "../otp/otp.service";
import { Ride } from "../rider/ride.model";
import { SocketService } from "../socket/socket.service";
import { User } from "../user/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  registerUser,
  rotateRefreshToken,
  validatePassword,
} from "./auth.service";
import { Notification } from "./notification.model";
import { SOS } from "./sos.model";

export class AuthController {
  static async register(req: Request, res: Response) {
    const parsed = registerSchema.parse(req.body);
    if ((parsed.role as string) === "admin") {
      return res.status(400).json({ error: "Cannot self-register as admin" });
    }

    const { user, otp } = await registerUser({
      email: parsed.email,
      password: parsed.password,
      role: parsed.role,
      profile: {
        ...parsed.profile,
        avatarUrl: parsed.profile.avatarUrl ?? undefined,
        phone: parsed.profile.phone ?? undefined,
        address: parsed.profile.address ?? undefined,
      },
    });

    if (user.role === "driver") {
      const exists = await Driver.findOne({ user: user._id });
      if (!exists) {
        await Driver.create({
          user: user._id,
          approved: false,
          suspended: false,
          available: false,
          vehicle: {
            model: "unavailable",
            licensePlate: "unavailable",
          },
        });
      }
    }

    await sendEmailVerification(user.email, otp);
    res.status(201).json({
      message: "Registered Successfully. OTP has been sent to your email.",
      userId: user._id,
    });
  }

  static async verifyEmail(req: Request, res: Response) {
    const { email, otp } = otpSchema.parse(req.body);
    const ok = await verifyOTP(email, "email_verification", otp);
    if (!ok) return res.status(400).json({ error: "Invalid or expired OTP" });
    await User.updateOne(
      { email: email.toLowerCase() },
      { isEmailVerified: true }
    );
    res.json({ message: "Email has been verified" });
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await validatePassword(email, password); // will throw if invalid

      if (!user.isEmailVerified) {
        return res.status(403).json({ error: "Email is not verified" });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // ⬇️ Set tokens in cookies
      // setAuthCookie(res, { accessToken, refreshToken });

      return res.json({
        message: "Login successful",
        accessToken,
        refreshToken,
        role: user.role,
        status: user.status,
      });
    } catch (err: any) {
      return res
        .status(401)
        .json({ error: err.message || "Invalid credentials" });
    }
  }

  static async resendOtp(req: Request, res: Response) {
    const { email } = resendOtpSchema.parse(req.body);
    const otp = generateOTP();
    await storeOTP(
      email,
      "email_verification",
      otp,
      Number(process.env.OTP_TTL_SECONDS || 300)
    );
    await sendEmailVerification(email, otp);
    res.json({ message: "OTP resent" });
  }

  static async refreshToken(req: Request, res: Response) {
    const token =
      req.cookies.refreshToken ||
      req.body.refreshToken ||
      req.headers["x-refresh-token"];
    if (!token) return res.status(401).json({ error: "Missing refresh token" });

    const jwt = await import("jsonwebtoken");
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
      if (payload.type !== "refresh") throw new Error("Invalid");

      const user = await User.findById(payload.sub);
      if (!user || user.tokenVersion !== payload.tokenVersion) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      const newRefresh = await rotateRefreshToken(user._id.toString());
      const access = generateAccessToken(user);

      // ⬇️ update cookies
      // setAuthCookie(res, { accessToken: access, refreshToken: newRefresh });

      res.json({ accessToken: access, refreshToken: newRefresh });
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = resendOtpSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ message: "If account exists OTP sent" });
    const otp = generateOTP();
    await storeOTP(
      email,
      "password_reset",
      otp,
      Number(process.env.OTP_TTL_SECONDS || 300)
    );
    await sendPasswordResetOTP(email, otp);
    res.json({ message: "OTP sent" });
  }

  static async resetPassword(req: Request, res: Response) {
    const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);
    const ok = await verifyOTP(email, "password_reset", otp);
    if (!ok) return res.status(400).json({ error: "Invalid or expired OTP" });
    const hash = await hashPassword(newPassword);
    await User.updateOne(
      { email: email.toLowerCase() },
      { password: hash, tokenVersion: Date.now() }
    );
    res.json({ message: "Password updated" });
  }

  static async logout(_req: Request, res: Response) {
    // ⬇️ Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({ message: "Logged out" });
  }

  //get current user details
  static me = async (req: any, res: Response) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user?.status === "blocked" || user?.isEmailVerified === false) {
        return res.status(403).json({
          message: "Your account has been blocked or not verified.",
        });
      }
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  /**
   * PATCH /api/auth/me
   * Update current user's profile (name, phone, avatarUrl, address)
   */
  static updateMe = async (req: any, res: Response) => {
    try {
      const userId = req.user?.userId; // req.user should come from auth middleware

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized - no userId found" });
      }

      const { name, phone, avatarUrl, address } = req.body;

      // Only allow updating safe profile fields
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            "profile.name": name,
            "profile.phone": phone,
            "profile.avatarUrl": avatarUrl,
            "profile.address": address,
          },
        },
        { new: true, runValidators: true }
      ).select("-email -password -refreshTokens -tokenVersion -status"); // Exclude sensitive fields

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  static trouble = async (req: any, res: Response) => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== "rider" && userRole !== "driver") {
        return res
          .status(403)
          .json({ message: "Only riders and drivers can send SOS alerts" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Find user's current active ride
      let activeRide;
      if (userRole === "rider") {
        activeRide = await Ride.findOne({
          rider: userId,
          status: { $in: ["accepted", "picked_up", "in_transit"] },
        });
      } else if (userRole === "driver") {
        const driver = await Driver.findOne({ user: userId });
        if (driver) {
          activeRide = await Ride.findOne({
            driver: driver._id,
            status: { $in: ["accepted", "picked_up", "in_transit"] },
          });
        }
      }

      if (!activeRide) {
        return res.status(400).json({ message: "No active ride found" });
      }

      // Check if SOS already sent for this ride by this user
      const existingSOS = await SOS.findOne({
        [userRole]: userId,
        ride: activeRide._id,
      });

      if (existingSOS) {
        return res
          .status(400)
          .json({ message: "SOS alert already sent for this ride" });
      }

      const { location, message } = troubleSchema.parse(req.body);

      // Create SOS record
      const sosData: any = {
        ride: activeRide._id,
        location,
        message,
      };
      sosData[userRole] = userId;
      await SOS.create(sosData);

      // Create notification for admin dashboard
      const notification = await Notification.create({
        type: "sos",
        title: "🚨 Emergency SOS Alert",
        message: `${
          user.profile.name
        } (${userRole}) has sent an emergency SOS alert. ${
          message || "No additional message provided."
        }`,
        riderName: user.profile.name,
        riderEmail: user.email,
        rideId: activeRide._id,
        location,
      });

      // Emit real-time notification to admin
      SocketService.emitToAdmin("sos_alert", {
        type: "sos",
        title: "🚨 Emergency SOS Alert",
        message: `${user.profile.name} has sent an emergency SOS alert`,
        riderName: user.profile.name,
        riderEmail: user.email,
        rideId: activeRide._id.toString(),
        location,
        timestamp: new Date(),
        _id: notification._id,
      });

      // Send SOS email to admin
      await sendSOSAlert(
        user.profile.name,
        user.email,
        activeRide._id.toString(),
        location,
        message
      );

      res.json({
        success: true,
        message: "Emergency SOS alert sent successfully",
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  static getNotifications = async (req: any, res: Response) => {
    try {
      const notifications = await Notification.find()
        .sort({ timestamp: -1 })
        .limit(50);

      res.json({
        success: true,
        data: notifications,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
}
