import { JWT_SECRET } from "../../config/env";
import { User } from "../../models/User";
import { logger } from "../../utils/logger";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export default async function signin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Please enter a valid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      message: "Signin successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    logger.error("[AuthController] Signin error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
