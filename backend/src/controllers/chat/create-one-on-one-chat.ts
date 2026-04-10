import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import { Chat } from "../../models/Chat";
import { getIO } from "../../services/socket";

export default async function createChatController(
  req: Request,
  res: Response,
) {
  try {
    const { receiver } = req.body;
    if (!receiver) {
      return res
        .status(400)
        .json({ success: false, message: "Receiver user ID is required" });
    }
    const chatData = {
      chatName: "one-on-one",
      isGroupChat: false,
      users: [req.userId, receiver],
    };
    let chat = await Chat.create(chatData);

    chat = await chat.populate("users", "-password");

    chat = await chat.populate("latestMessage");

    chat.users.forEach((user) => {
      getIO().to(user._id.toString()).emit("chat:new", chat);
    });

    return res.status(200).json({ chat: chat, success: true });
  } catch (error) {
    logger.error("Error creating chat:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
