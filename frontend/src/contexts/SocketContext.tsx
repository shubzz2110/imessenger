import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Socket } from "socket.io-client";
import useAuthstore from "../store/auth";
import { createSocket } from "../services/socket";

const SocketContext = createContext<{
  socket: Socket | null;
  connected: boolean;
}>({
  socket: null,
  connected: false,
});

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const accessToken = useAuthstore((s) => s.accessToken);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const newSocket = createSocket(accessToken);
    socketRef.current = newSocket;

    newSocket.on("connected", () => {
      setConnected(true);
    });

    newSocket.on("connect", () => {
      console.log("[Socket] Connected:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
      console.log("[Socket] Disconnected");
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);
