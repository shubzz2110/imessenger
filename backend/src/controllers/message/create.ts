import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import { Message } from "../../models/Message";
import { Chat } from "../../models/Chat";
import { getIO } from "../../services/socket";

export default async function createMessage(req: Request, res: Response) {
  try {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return res.status(400).json({
        message: "Invalid data",
      });
    }

    let message = await Message.create({
      sender: req.userId,
      content,
      chat: chatId,
      readBy: [req.userId!], // sender has read it
    });

    // populate sender, chat & readBy
    message = await message.populate("sender", "name email");
    message = await message.populate("readBy", "name email");
    message = await message.populate("chat");

    message = await message.populate({
      path: "chat.users",
      select: "name email",
    });

    // update latest message in chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    // Instead of: getIO().to(chatId).emit("update_latest_message", message);
    const chat = await Chat.findById(chatId).select("users");
    chat?.users.forEach((userId) => {
      getIO().to(userId.toString()).emit("update_latest_message", message);
    });

    return res.json({ success: true, message });
  } catch (error) {
    logger.error("Error creating message:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the message." });
  }
}
