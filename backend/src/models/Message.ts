import mongoose, { Types, Document } from "mongoose";

export interface IMessage extends Document {
  chat: Types.ObjectId; // Reference to the chat
  sender: Types.ObjectId; // Reference to the user who sent the message
  content: string; // The message content
  readBy: Types.ObjectId[]; // Array of user IDs who have read the message
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

messageSchema.index({ chat: 1 }); // Index for efficient querying by chat ID

export const Message = mongoose.model<IMessage>("Message", messageSchema);
