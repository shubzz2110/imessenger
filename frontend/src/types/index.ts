export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Chat {
  _id: string;
  chatName?: string;
  isGroupChat: boolean;
  users: User[];
  latestMessage?: Message;
  groupAdmin?: User;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  _id: string;
  chat: Chat;
  sender: User;
  content: string;
  readBy?: User[];
  createdAt?: string;
  updatedAt?: string;
}
