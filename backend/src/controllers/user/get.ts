import { User } from "../../models/User";
import { logger } from "../../utils/logger";
import { Request, Response } from "express";

export default async function getUserController(req: Request, res: Response) {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select("-password")
      .sort({ name: 1 });

    return res
      .status(200)
      .json({ message: "Users retrieved successfully", users });
  } catch (error) {
    logger.error("Error in getUserController:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
