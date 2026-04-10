import { Request, Response } from "express";
import { Message } from "../../models/Message";

export default async function readByReceiver(req: Request, res: Response) {
  try {
    const { messageId } = req.params;
    const { receiverId } = req.body;

    if (!messageId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "Message ID and Receiver ID are required.",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    // Only add to readBy if the receiver is not the sender and hasn't already read it
    if (
      message.sender.toString() !== receiverId &&
      !message.readBy.includes(receiverId)
    ) {
      message.readBy.push(receiverId);
      await message.save();
    }

    return res.status(200).json({
      success: true,
      message: "Messages marked as read by receiver.",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while marking messages as read.",
    });
  }
}
