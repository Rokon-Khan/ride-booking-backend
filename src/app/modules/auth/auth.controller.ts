import { Request, Response } from "express";
import { hashPassword } from "../../config/hash.password";
import {
  sendEmailVerification,
  sendPasswordResetOTP,
} from "../../utils/email.service";
import { generateOTP } from "../../utils/generate.otp";
import { setAuthCookie } from "../../utils/setAuthCookie";
import {
  loginSchema,
  otpSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
} from "../../utils/validators";
import { Driver } from "../driver/driver.model";
import { storeOTP, verifyOTP } from "../otp/otp.service";
import { User } from "../user/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  registerUser,
  rotateRefreshToken,
  validatePassword,
} from "./auth.service";

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
            mode: "unavailable",
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
    const { email, password } = loginSchema.parse(req.body);
    const user = await validatePassword(email, password);
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: "Email is not verified" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // ⬇️ Set tokens in cookies
    setAuthCookie(res, { accessToken, refreshToken });

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      role: user.role,
    });
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
      setAuthCookie(res, { accessToken: access, refreshToken: newRefresh });

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
      { passwordHash: hash, tokenVersion: Date.now() }
    );
    res.json({ message: "Password updated" });
  }

  static async logout(_req: Request, res: Response) {
    // ⬇️ Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    res.json({ message: "Logged out" });
  }

  static me = async (req: any, res: Response) => {
    try {
      const user = await User.findById(req.user.userId);
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}
