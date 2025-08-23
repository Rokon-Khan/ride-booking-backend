import { hashPassword } from "../../config/hash.password";
import { signToken } from "../../config/jwt";
import { generateOTP } from "../../utils/generate.otp";
import { verifyPassword } from "../../utils/verify.password";
import { storeOTP } from "../otp/otp.service";
import { User } from "../user/user.model";

interface RegisterOptions {
  email: string;
  password: string;
  role: "rider" | "driver";
  profile: {
    name: string;
    avatarUrl?: string;
    phone?: string;
    address?: string;
  };
}

export async function registerUser(opts: RegisterOptions) {
  const email = opts.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered");

  // role cannot be admin here (enforced by validation)
  const passwordHash = await hashPassword(opts.password);

  const user = await User.create({
    email,
    password: passwordHash,
    role: opts.role,
    isEmailVerified: false,
    profile: {
      name: opts.profile.name,
      avatarUrl: opts.profile.avatarUrl || null,
      phone: opts.profile.phone,
      address: opts.profile.address,
    },
  });

  const otp = generateOTP();
  await storeOTP(
    email,
    "email_verification",
    otp,
    Number(process.env.OTP_TTL_SECONDS || 300)
  );
  return { user, otp };
}

export async function validatePassword(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("Invalid credentials");
  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");
  return user;
}

export function generateAccessToken(user: any) {
  return signToken(
    {
      sub: user._id.toString(),
      role: user.role,
      type: "access",
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: Number(process.env.JWT_ACCESS_EXPIRES) || "2h" }
  );
}

export function generateRefreshToken(user: any, overrideVersion?: number) {
  return signToken(
    {
      sub: user._id.toString(),
      role: user.role,
      type: "refresh",
      tokenVersion: overrideVersion ?? user.tokenVersion,
    },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: Number(process.env.JWT_REFRESH_EXPIRES) || "7d" }
  );
}

export async function rotateRefreshToken(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  user.tokenVersion += 1;
  await user.save();
  return generateRefreshToken(user);
}
