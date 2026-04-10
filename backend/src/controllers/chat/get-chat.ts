import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import { Chat } from "../../models/Chat";

export default async function getChatController(req: Request, res: Response) {
  try {
    const { receiver } = req.body;

    if (!receiver) {
      return res
        .status(400)
        .json({ success: false, message: "Receiver ID is required" });
    }
    const chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.userId, receiver], $size: 2 },
    })
      .populate("users", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name email",
        },
      });
    return res.status(200).json({ chat, success: true });
  } catch (error) {
    logger.error("Error fetching chat:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
