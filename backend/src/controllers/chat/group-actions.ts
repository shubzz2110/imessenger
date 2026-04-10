import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import { Chat } from "../../models/Chat";

export async function addToGroupController(req: Request, res: Response) {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Chat ID and User ID are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res
        .status(404)
        .json({ success: false, message: "Group chat not found" });
    }

    if (chat.groupAdmin?.toString() !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: "Only group admin can add members" });
    }

    const updated = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: userId } },
      { new: true },
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json({ success: true, chat: updated });
  } catch (error) {
    logger.error("Error adding user to group:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

export async function removeFromGroupController(req: Request, res: Response) {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Chat ID and User ID are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res
        .status(404)
        .json({ success: false, message: "Group chat not found" });
    }

    if (chat.groupAdmin?.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only group admin can remove members",
      });
    }

    const updated = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true },
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json({ success: true, chat: updated });
  } catch (error) {
    logger.error("Error removing user from group:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

export async function renameGroupController(req: Request, res: Response) {
  try {
    const { chatId, chatName } = req.body;

    if (!chatId || !chatName) {
      return res.status(400).json({
        success: false,
        message: "Chat ID and new name are required",
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res
        .status(404)
        .json({ success: false, message: "Group chat not found" });
    }

    if (chat.groupAdmin?.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only group admin can rename the group",
      });
    }

    const updated = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true },
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json({ success: true, chat: updated });
  } catch (error) {
    logger.error("Error renaming group:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
