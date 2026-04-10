import { User } from "../../models/User";
import { logger } from "../../utils/logger";
import { Request, Response } from "express";

export default async function signup(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    await User.create({ name, email, password });

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    logger.error("[Signup] Error during user registration:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
