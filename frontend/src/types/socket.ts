import { Socket } from "socket.io-client";
import type { Message } from ".";

// Events server sends to client
export interface ServerToClientEvents {
  connected: () => void;
  message_received: (message: Message) => void;
  typing: () => void;
  stop_typing: () => void;
  user_online: (userId: string) => void;
  user_offline: (data: { userId: string; lastSeen: string }) => void;
  online_users: (userIds: string[]) => void;
}

// Events client sends to server
export interface ClientToServerEvents {
  join_chat: (chatId: string) => void;
  leave_chat: (chatId: string) => void;
  send_message: (message: Message) => void;
  typing: (chatId: string) => void;
  stop_typing: (chatId: string) => void;
}

// Typed socket
export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
