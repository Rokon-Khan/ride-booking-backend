import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ROLES } from "../../config/constants";
import { Driver } from "../driver/driver.model";
import { User } from "../user/user.model";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, profile } = req.body;
    if (![ROLES.RIDER, ROLES.DRIVER].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashed,
      role,
      profile,
    });

    if (role === "driver") {
      const exists = await Driver.findOne({ user: user._id });
      if (!exists) {
        await Driver.create({
          user: user._id,
          approved: false,
          suspended: false,
          available: false,
        });
      }
    }
    // JWT generation
    const token = jwt.sign(
      { userId: user._id, role: user.role, status: user.status },
      process.env.JWT_SECRET!,
      { expiresIn: "2h" }
    );
    res.status(201).json({ message: "User registered successfully", token });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { userId: user._id, role: user.role, status: user.status },
      process.env.JWT_SECRET!,
      { expiresIn: "2h" }
    );
    res.json({ message: "Login successful", role: user.role, token });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  // If implementing JWT blacklist, add here. For now, just respond 200.
  return res.status(200).json({ message: "Logged out" });
};

export const me = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
