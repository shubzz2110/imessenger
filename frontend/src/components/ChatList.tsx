import { EditIcon, Search, User2, Users2 } from "lucide-react";
import { useEffect, useState } from "react";
import StartChatModal from "./StartChatModal";
import clsx from "clsx";
import type { Chat } from "../types";
import useAuthstore from "../store/auth";
import moment from "moment";
import useChatStore from "../store/chat";
import { useSocket } from "../contexts/SocketContext";

interface ChatListProps {
  chats: Chat[];
  onChatSelect?: (chatId: string) => void;
}

export default function ChatList({ chats, onChatSelect }: ChatListProps) {
  const authStore = useAuthstore();
  const chatStore = useChatStore();
  const { socket } = useSocket();

  const [isStartChatModalOpen, setIsStartChatModalOpen] = useState(false);

  const getChatDisplayName = (chat: Chat) => {
    if (chat.isGroupChat) return chat.chatName || "Group Chat";
    return (
      chat.users.find((u) => u._id !== authStore.user?._id)?.name ||
      "Unknown User"
    );
  };
  const setChat = (chat: Chat) => {
    if (chatStore.selectedChat?._id) {
      socket?.emit("leave_chat", chatStore.selectedChat._id);
    }
    chatStore.setSelectedChat(chat);
    onChatSelect?.(chat._id);
    socket?.emit("join_chat", chat._id);
    if (chat.isGroupChat) {
      chatStore.setSelectedUser(null);
    } else {
      chatStore.setSelectedUser(
        chat.users.find((u) => u._id !== authStore.user?._id) || null,
      );
    }
  };
  function LastMessageTime({ timestamp }: { timestamp: string }) {
    const [display, setDisplay] = useState(() => formatTime(timestamp));

    useEffect(() => {
      const interval = setInterval(() => {
        setDisplay(formatTime(timestamp));
      }, 60_000); // update every minute
      return () => clearInterval(interval);
    }, [timestamp]);

    return <span className="text-xs text-slate-500">{display}</span>;
  }

  function formatTime(timestamp: string) {
    const now = moment();
    const messageTime = moment(timestamp);
    const diffDays = now.diff(messageTime, "days");
    const diffSeconds = now.diff(messageTime, "seconds");

    if (diffSeconds < 60) return "now";
    if (diffDays === 0) return messageTime.format("h:mm A");
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return messageTime.format("ddd");
    return messageTime.format("DD/MM/YY");
  }
  return (
    <div className="bg-white rounded-2xl flex flex-col w-full max-w-sm h-full shadow-brand">
      <div className="flex items-center justify-between w-full h-max px-5 py-3 border-b border-slate-200">
        <h1 className="text-lg font-semibold text-slate-800 leading-8">
          Chats
        </h1>
        <button
          className="flex items-center justify-center w-11 h-11 min-w-11 min-h-11 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          onClick={() => setIsStartChatModalOpen(true)}
        >
          <EditIcon size={18} />
        </button>
      </div>
      <div className="px-5 py-2.5 border-b border-slate-200">
        <div className="relative h-max">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            name="search"
            id="search-user"
            className="form-input pl-10!"
            placeholder="Search a chat..."
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 overflow-auto grow basis-0 shrink">
        {chats.length > 0 ? (
          chats.map((chat) => {
            return (
              <div
                key={chat._id}
                className={clsx(
                  "flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors",
                  chatStore.selectedChat?._id === chat._id && "bg-slate-100",
                )}
                role="button"
                onClick={() => setChat(chat)}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                    {chat.isGroupChat ? (
                      <Users2 size={18} />
                    ) : (
                      <User2 size={18} />
                    )}
                  </div>
                  {/* {!chat.isGroupChat && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )} */}
                </div>
                <div className="flex flex-col grow min-w-0">
                  <span className="text-sm font-semibold leading-5 text-slate-800 truncate">
                    {getChatDisplayName(chat)}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    {chat.latestMessage
                      ? chat.isGroupChat
                        ? `${chat.latestMessage.sender?.name}: ${chat.latestMessage.content}`
                        : chat.latestMessage.content
                      : "No messages yet"}
                  </span>
                </div>
                <div className="flex flex-col items-end space-y-1 shrink-0">
                  {chat.latestMessage?.createdAt && (
                    <span className="text-xs text-slate-500">
                      {chat.latestMessage?.createdAt && (
                        <LastMessageTime
                          timestamp={chat.latestMessage.createdAt}
                        />
                      )}
                    </span>
                  )}
                  {!!chat.unreadCount && chat.unreadCount > 0 && (
                    <div className="min-w-5 h-5 flex items-center justify-center text-white bg-blue-500 text-xs rounded-full px-1.5">
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div>No chats</div>
        )}
      </div>
      {isStartChatModalOpen && (
        <StartChatModal
          chats={[]}
          onClose={() => setIsStartChatModalOpen(false)}
        />
      )}
    </div>
  );
}
