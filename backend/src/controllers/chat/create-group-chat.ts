import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import { Chat } from "../../models/Chat";

export default async function createGroupChatController(
  req: Request,
  res: Response,
) {
  try {
    const { chatName, users } = req.body;

    if (!chatName || !users || !Array.isArray(users) || users.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Group name and at least 2 other users are required",
      });
    }

    // Add the creator to the users list
    const allUsers = [req.userId, ...users];

    let chat = await Chat.create({
      chatName,
      isGroupChat: true,
      users: allUsers,
      groupAdmin: req.userId,
    });

    chat = await chat.populate("users", "-password");
    chat = await chat.populate("groupAdmin", "-password");

    return res.status(200).json({ success: true, chat });
  } catch (error) {
    logger.error("Error creating group chat:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
