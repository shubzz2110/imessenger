import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { requestLogger } from "./middlewares/requestLogger";
import { logger } from "./utils/logger";
import http from "http";
import { connectDatabase } from "./config/database";
import { IS_PRODUCTION, NODE_ENV, PORT } from "./config/env";
import corsOptions from "./config/cors";

import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import chatRouter from "./routes/chat.routes";
import messageRouter from "./routes/message.routes";
import { initSocket } from "./services/socket";
import { User } from "./models/User";

const app = express();

const httpServer = http.createServer(app);

const io = initSocket(httpServer);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // required if serving embeddable content
    contentSecurityPolicy: IS_PRODUCTION
      ? undefined // use helmet's strict defaults in prod
      : false, // relax in development for tooling
  }),
);

app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(requestLogger);

io.on("connection", async (socket) => {
  const userId = socket.data.userId;
  logger.info(
    `[Socket] Connected to socketID - ${socket.id} with user ${userId}`,
  );

  if (userId) {
    socket.join(userId);
    // logger.info(`[Socket] Here we can mark User - ${userId} is online`);
    try {
      await User.updateOne({ _id: userId }, { $set: { isOnline: true } });
      logger.info(`[Socket] Marked User - ${userId} as online`);

      // Notify all clients about the user's online status
      io.emit("user_status_change", {
        userId,
        isOnline: true,
      });
    } catch (error) {
      logger.error(`[Socket] Error marking user ${userId} online:`, error);
    }
  }

  socket.on("join_chat", (chatId: string) => {
    socket.join(chatId);
    logger.info(`[Socket] User - ${userId} joined chat - ${chatId}`);
  });

  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
    logger.info(`[Socket] User - ${userId} left chat - ${chatId}`);
  });

  socket.emit("connected");

  socket.on("disconnect", async () => {
    logger.info(`[Socket] Disconnected: ${socket.id} User: ${userId}`);
    if (userId) {
      try {
        await User.updateOne(
          { _id: userId },
          { $set: { isOnline: false, lastSeen: new Date().toISOString() } },
        );
        logger.info(`[Socket] Marked User - ${userId} as offline`);

        // Notify all clients about the user's offline status
        io.emit("user_status_change", {
          userId,
          isOnline: false,
          lastSeen: new Date().toISOString(),
        });
      } catch (error) {
        logger.error(`[Socket] Error marking user ${userId} offline:`, error);
      }
    }
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/chats", chatRouter);

async function bootstrap(): Promise<void> {
  try {
    // Connect to MongoDB first so the app is ready to serve requests
    await connectDatabase();

    // Start the HTTP server
    httpServer.listen(PORT, () => {
      logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      logger.info(`  🚀  Server started`);
      logger.info(`  ├── Environment : ${NODE_ENV}`);
      logger.info(`  ├── HTTP        : http://localhost:${PORT}`);
      logger.info(`  ├── API         : http://localhost:${PORT}/api}`);
      logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  } catch (error) {
    logger.error("[Server] Failed to start:", error);
    process.exit(1);
  }
}

bootstrap();
