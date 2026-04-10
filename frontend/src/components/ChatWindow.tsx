import { Send, User2, Users2 } from "lucide-react";
import useAuthstore from "../store/auth";
import useChatStore from "../store/chat";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { errorHandler } from "../lib/utlils";
import api from "../lib/api";
import type { Chat, Message, User } from "../types";
import { useSocket } from "../contexts/SocketContext";
import moment from "moment";

export default function ChatWindow() {
  const authStore = useAuthstore();
  const chatStore = useChatStore();
  const { socket } = useSocket();
  const selectedChat = chatStore.selectedChat;

  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await api.get<{ success: boolean; messages: Message[] }>(
        `/messages/${chatId}`,
      );

      setMessages(response.data.messages);
      setTimeout(() => {
        api.put(`/messages/read-by/${chatId}`).then(() => {
          setMessages((prev) =>
            prev.map((msg) => {
              const alreadyRead = msg.readBy?.some(
                (u) => u._id === authStore.user?._id,
              );
              const isSender = msg.sender._id === authStore.user?._id;
              if (isSender || alreadyRead) return msg;
              return {
                ...msg,
                readBy: [...(msg.readBy || []), authStore.user!],
              };
            }),
          );
        });
      }, 5000);
    } catch (error) {
      errorHandler(error);
    }
  };

  const sendMessage = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    let chat = selectedChat;
    const receiverId = chatStore.selectedUser?._id;

    try {
      if (!chat) {
        if (!receiverId) {
          console.error("ReceiverId required for new chat");
          return;
        }

        const response = await api.post<{ success: boolean; chat: Chat }>(
          "/chats/one-on-one",
          {
            receiver: receiverId,
          } as { receiver: string },
        );

        chat = response.data.chat;
        chatStore.setSelectedChat(chat);
        socket?.emit("join_chat", chat._id);
      }
      const tempId = `temp-${Date.now()}`;

      const tempMessage: Message & { status: string } = {
        _id: tempId,
        content,
        chat,
        sender: authStore.user!,
        status: "sending",
      };

      setMessages((prev) => [...prev, tempMessage]);

      const createMessageResponse = await api.post<{
        success: boolean;
        message: Message;
      }>("/messages", {
        content,
        chatId: chat._id,
      } as { content: string; chatId: string });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId
            ? { ...createMessageResponse.data.message, status: "sent" }
            : msg,
        ),
      );
      setContent("");
      chatStore.updateChatLatestMessage(
        chat._id,
        createMessageResponse.data.message,
      );
    } catch (error) {
      errorHandler(error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id.startsWith("temp-") ? { ...msg, status: "failed" } : msg,
        ),
      );
    }
  };

  const chatDisplayName = useMemo(() => {
    if (selectedChat?.isGroupChat) return selectedChat.chatName || "Group Chat";
    return chatStore.selectedUser?.name || "Unknown User";
  }, [selectedChat, chatStore.selectedUser]);

  // On escape key press, close the chat window
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      chatStore.closeChat();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message: Message) => {
      // Skip own messages — already handled by optimistic update
      if (message.sender._id === authStore.user?._id) return;

      const chatId =
        typeof message.chat === "string" ? message.chat : message.chat._id;
      if (chatId === selectedChat?._id) {
        setMessages((prev) => {
          if (prev.find((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        api
          .put(`/messages/read-by-receiver/${message._id}`, {
            receiverId: authStore.user?._id,
          })
          .catch((err) =>
            console.error("Failed to update read by status:", err),
          );
      }
    };

    socket.on("update_latest_message", handleIncomingMessage);

    return () => {
      socket.off("update_latest_message", handleIncomingMessage);
    };
  }, [socket, selectedChat?._id, authStore.user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  function UserStatus({
    user,
    isGroupChat,
    memberCount,
  }: {
    user: User | null;
    isGroupChat?: boolean;
    memberCount?: number;
  }) {
    const [, forceUpdate] = useState(0);

    useEffect(() => {
      if (user?.isOnline || isGroupChat) return;
      const interval = setInterval(() => forceUpdate((n) => n + 1), 60_000);
      return () => clearInterval(interval);
    }, [user?.isOnline, user?.lastSeen, isGroupChat]);

    return (
      <p className="text-xs font-normal leading-3 text-slate-500">
        {isGroupChat
          ? `${memberCount} members`
          : user?.isOnline
            ? "Online"
            : `Last seen ${moment(user?.lastSeen).fromNow()}`}
      </p>
    );
  }

  if (!chatStore.selectedUser && !selectedChat) {
    return (
      <div className="bg-white rounded-2xl shadow-brand flex items-center justify-center h-full grow">
        <p className="text-sm text-slate-500">
          Start a conversation by sending a message.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-brand flex flex-col h-full grow">
      <div className="flex items-center justify-between w-full h-max px-5 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-11 h-11 min-w-11 min-h-11 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
              {selectedChat?.isGroupChat ? (
                <Users2 size={20} />
              ) : (
                <User2 size={20} />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-sm font-semibold text-slate-800 leading-5">
              {chatDisplayName}
            </h1>
            <UserStatus
              user={chatStore.selectedUser}
              isGroupChat={selectedChat?.isGroupChat}
              memberCount={selectedChat?.users.length}
            />
          </div>
        </div>
      </div>

      <div className="grow shrink basis-0 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.map((message, index) => {
          const senderId = message?.sender?._id;
          const isOwn = senderId === authStore.user?._id;
          const isUnread =
            !isOwn &&
            !message.readBy?.some((u) => u._id === authStore.user?._id);
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const isPrevRead =
            !prevMessage ||
            prevMessage.sender._id === authStore.user?._id ||
            prevMessage.readBy?.some((u) => u._id === authStore.user?._id);
          const showNewMessagesDivider = isUnread && isPrevRead;

          return (
            <React.Fragment key={message?._id}>
              {showNewMessagesDivider && (
                <div className="flex items-center gap-5">
                  <span className="h-0.5 w-full grow bg-slate-200"></span>
                  <h1 className="text-slate-800 font-semibold text-sm leading-4 whitespace-nowrap">
                    New Messages
                  </h1>
                  <span className="h-0.5 w-full grow bg-slate-200"></span>
                </div>
              )}
              <div
                className={`flex items-end gap-2 max-w-xs xl:max-w-2xl ${
                  isOwn ? "self-end flex-row-reverse" : "self-start"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <User2 size={18} />
                </div>
                <div className="flex flex-col gap-0.5">
                  {selectedChat?.isGroupChat && !isOwn && (
                    <span className="text-xs text-slate-400 px-1">
                      {message?.sender?.name}
                    </span>
                  )}
                  <div
                    className={`px-2.5 py-1 text-sm flex items-center gap-2.5 ${
                      isOwn
                        ? "bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl"
                        : "bg-slate-100 text-slate-900 rounded-r-2xl rounded-tl-2xl"
                    }`}
                  >
                    {message?.content || ""}
                    <span
                      className={`text-[10px] self-end whitespace-nowrap ${isOwn ? "text-white" : "text-slate-500"}`}
                    >
                      {moment(message?.createdAt).format("h:mm A")}
                    </span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="p-2.5 border-t border-white/5 flex items-center gap-2.5"
        onSubmit={sendMessage}
      >
        <input
          type="text"
          placeholder="Type a message..."
          className="form-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="submit"
          disabled={
            !content.trim() || (!selectedChat && !chatStore.selectedUser)
          }
          className="flex items-center justify-center min-w-10 min-h-10 w-10 h-10 rounded-full bg-blue-500 text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
