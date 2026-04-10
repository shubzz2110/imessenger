import mongoose, { Document, Types } from "mongoose";

export interface IChat extends Document {
  chatName?: string;
  isGroupChat: boolean;
  users: Types.ObjectId[];
  latestMessage?: Types.ObjectId;
  groupAdmin?: Types.ObjectId;
}

const chatSchema = new mongoose.Schema<IChat>(
  {
    chatName: { type: String },
    isGroupChat: { type: Boolean, required: true },
    users: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Chat = mongoose.model<IChat>("Chat", chatSchema);
