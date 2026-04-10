import { useEffect, useRef, useState } from "react";
import ChatList from "../../components/ChatList";
import ChatWindow from "../../components/ChatWindow";
import type { Chat, Message } from "../../types";
import { errorHandler } from "../../lib/utlils";
import api from "../../lib/api";
import { useSocket } from "../../contexts/SocketContext";
import useAuthstore from "../../store/auth";
import useChatStore from "../../store/chat";

export default function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const { socket } = useSocket();

  const authStore = useAuthstore();
  const currentUser = authStore.user;
  const selectedChatId = useChatStore((s) => s.selectedChat?._id);
  const selectedChatIdRef = useRef(selectedChatId);
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  const resetUnreadCount = (chatId: string) => {
    setTimeout(() => {
      setChats((prev) =>
        prev.map((c) => (c._id === chatId ? { ...c, unreadCount: 0 } : c)),
      );
    }, 5000);
  };

  const fetchChats = async () => {
    try {
      const response = await api.get<{ success: boolean; chats: Chat[] }>(
        "/chats",
      );
      setChats(response.data.chats);
    } catch (error) {
      errorHandler(error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewChat = (chat: Chat) => {
      setChats((prev) => {
        if (prev.find((c) => c._id === chat._id)) return prev;
        return [chat, ...prev];
      });
      // Auto-join the room so you receive future messages
      socket.emit("join_chat", chat._id);
    };

    const handleLatestMessage = (message: Message) => {
      setChats((prev) =>
        prev.map((c: Chat) =>
          c._id === message.chat._id
            ? {
                ...c,
                latestMessage: message,
                unreadCount:
                  message.sender._id === currentUser?._id ||
                  selectedChatIdRef.current === message.chat._id
                    ? 0
                    : (c.unreadCount || 0) + 1,
              }
            : c,
        ),
      );
    };

    socket.on("chat:new", handleNewChat);
    socket.on("update_latest_message", handleLatestMessage);

    return () => {
      socket.off("chat:new", handleNewChat);
      socket.off("update_latest_message", handleLatestMessage);
    };
  }, [socket, currentUser?._id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchChats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handler = (data: {
      userId: string;
      isOnline: boolean;
      lastSeen: string;
    }) => {
      const { userId, isOnline, lastSeen } = data;

      setChats((prev) =>
        prev.map((c) =>
          c.users.some((u) => u._id === userId)
            ? {
                ...c,
                users: c.users.map((u) =>
                  u._id === userId ? { ...u, isOnline, lastSeen } : u,
                ),
              }
            : c,
        ),
      );

      authStore.updateUserStatus(userId, isOnline);

      useChatStore.setState((state) => ({
        selectedChat: state.selectedChat?.users.some((u) => u._id === userId)
          ? {
              ...state.selectedChat,
              users: state.selectedChat.users.map((u) =>
                u._id === userId ? { ...u, isOnline, lastSeen } : u,
              ),
            }
          : state.selectedChat,
        selectedUser:
          state.selectedUser?._id === userId
            ? { ...state.selectedUser, isOnline, lastSeen }
            : state.selectedUser,
      }));
    };

    socket.on("user_status_change", handler);
    return () => {
      socket.off("user_status_change", handler);
    };
  }, [socket, authStore]);
  return (
    <div className="flex gap-6 w-full h-full">
      <ChatList chats={chats} onChatSelect={resetUnreadCount} />
      <ChatWindow />
    </div>
  );
}
