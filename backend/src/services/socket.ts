import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

let io: Server;

export const initSocket = (server: HTTPServer) => {
  io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: ["http://localhost:5173", "http://localhost:4000"],
      credentials: true,
    },
  });
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
