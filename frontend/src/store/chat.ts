import { create } from "zustand";
import type { Chat, Message, User } from "../types";
import { persist } from "zustand/middleware";

interface ChatState {
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  closeChat: () => void;
  updateChatLatestMessage: (chatId: string, message: Message) => void;
}

const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      selectedChat: null,
      selectedUser: null,
      setSelectedChat: (chat) => set({ selectedChat: chat }),
      setSelectedUser: (user) => set({ selectedUser: user }),
      closeChat: () => set({ selectedChat: null, selectedUser: null }),
      updateChatLatestMessage: (chatId: string, message: Message) => {
        set((state) => ({
          selectedChat:
            state.selectedChat?._id === chatId
              ? { ...state.selectedChat, latestMessage: message }
              : state.selectedChat,
        }));
      },
    }),
    {
      name: "chat-store",
    },
  ),
);

export default useChatStore;
