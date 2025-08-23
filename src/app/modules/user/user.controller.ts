import { Request, Response } from "express";
import { User } from "./user.model";

export const listUsers = async (req: Request, res: Response) => {
  // Add filters, pagination as needed
  const users = await User.find({});
  res.json({
    success: true,
    message: "Users retrieved successfully",
    data: users,
  });
};

export const viewUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

export const blockUser = async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "blocked" },
    { new: true }
  );
  if (!user) return res.status(400).json({ message: "User not found" });
  res.json({ message: "User blocked", user });
};

export const unblockUser = async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "active" },
    { new: true }
  );
  if (!user) return res.status(400).json({ message: "User not found" });
  res.json({ message: "User unblocked", user });
};
