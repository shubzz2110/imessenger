import { Request, Response } from "express";
import mongoose from "mongoose";
import { logger } from "../../utils/logger";
import { Message } from "../../models/Message";

export default async function updateReadBy(req: Request, res: Response) {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required.",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Only update messages NOT already read by this user, and not sent by this user
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userObjectId },
        readBy: { $ne: userObjectId },
      },
      { $addToSet: { readBy: userObjectId } },
    );

    return res.status(200).json({
      success: true,
      message: "Read by status updated successfully.",
    });
  } catch (error) {
    logger.error("Error updating read by status:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating read by status.",
    });
  }
}
