import { Search, User2 } from "lucide-react";
import Dialog from "./ui/Dialog";
import { useEffect, useMemo, useState } from "react";
import type { Chat, User } from "../types";
import api from "../lib/api";
import { errorHandler } from "../lib/utlils";
import clsx from "clsx";
import { useSocket } from "../contexts/SocketContext";
import useChatStore from "../store/chat";

interface StartChatModalProps {
  onClose: () => void;
  chats: Chat[];
}

export default function StartChatModal({
  onClose,
  chats,
}: StartChatModalProps) {
  const { socket } = useSocket();
  const chatStore = useChatStore();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await api.get<{ users: User[] }>("/users");
      setUsers(response.data.users);
    } catch (error) {
      errorHandler(error);
    }
  };

  const searchableUsers = useMemo(() => {
    if (!search) return users;
    return users.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, users]);

  const startChat = async (user: User) => {
    if (chatStore.selectedChat) {
      socket?.emit("leave_chat", chatStore.selectedChat._id);
    }

    const existingChat = chats.find((chat) =>
      chat.users.find((u) => u._id === user._id),
    );

    const selectedChat: Chat | null = existingChat || null;

    if (selectedChat && socket) {
      socket.emit("join_chat", selectedChat._id);
    }

    chatStore.setSelectedChat(selectedChat);
    chatStore.setSelectedUser(user);
    onClose();
  };

  useEffect(() => {
    (async () => {
      await fetchUsers();
    })();
  }, []);
  return (
    <Dialog
      title="Start a Chat"
      description="Select a user to start a chat"
      onClose={onClose}
      className="max-h-128! overflow-hidden flex flex-col w-full h-full space-y-4 p-5"
    >
      {/* Search */}
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
          placeholder="Search a user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {/* User list */}
      {searchableUsers.length > 0 ? (
        <div className="overflow-y-auto! flex flex-col grow shrink basis-0 space-y-2.5">
          {searchableUsers.map((user) => {
            return (
              <div
                key={user._id}
                className={clsx(
                  "flex items-center justify-between w-full h-max py-3 border rounded-2xl px-5 cursor-pointer hover:bg-slate-50 transition border-slate-200",
                )}
                role="button"
                onClick={() => startChat(user)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="flex items-center justify-center min-w-10 min-h-10 h-10 w-10 text-slate-500 rounded-full bg-slate-100">
                      <User2 size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h1 className="text-sm font-semibold text-slate-800 leading-5 capitalize">
                      {user.name}
                    </h1>
                    <p
                      className={`text-xs font-normal leading-4 ${user ? "text-green-500" : "text-slate-500"}`}
                    >
                      Online
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-500 text-center">No users found.</p>
      )}
    </Dialog>
  );
}
