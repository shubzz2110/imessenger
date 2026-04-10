import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import { Message } from "../../models/Message";

export default async function getChatMessages(req: Request, res: Response) {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .populate("readBy", "name email")
      .populate("chat");

    return res.json({ success: true, messages });
  } catch (error) {
    logger.error("Error fetching chat messages:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching chat messages.",
    });
  }
}
