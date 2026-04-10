import { Request, Response } from "express";
// import mongoose from "mongoose";
import { logger } from "../../utils/logger";
import { Chat } from "../../models/Chat";
import { Message } from "../../models/Message";
import mongoose from "mongoose";
// import { Message } from "../../models/Message";

export default async function getUserChatsController(
  req: Request,
  res: Response,
) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.userId } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name email",
        },
      })
      .sort({ updatedAt: -1 })
      .lean();

    // Get unread counts — must use ObjectId for aggregation ($ne won't cast strings)
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          chat: { $in: chats.map((c) => c._id) },
          sender: { $ne: userObjectId }, // exclude own messages
          readBy: { $ne: userObjectId },
        },
      },
      {
        $group: {
          _id: "$chat",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = new Map(
      unreadCounts.map((u) => [u._id.toString(), u.count]),
    );

    const chatsWithUnread = chats.map((chat) => ({
      ...chat,
      unreadCount: unreadMap.get(chat._id.toString()) || 0,
    }));

    return res.json({ success: true, chats: chatsWithUnread });
  } catch (error) {
    logger.error("Error fetching user chats:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
