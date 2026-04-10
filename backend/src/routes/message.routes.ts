import express from "express";
import authMiddleware from "../middlewares/auth";
import createMessage from "../controllers/message/create";
import getChatMessages from "../controllers/message/get-chat-messages";
import updateReadBy from "../controllers/message/update-read-by";
import readByReceiver from "../controllers/message/read-by-receiver";

const messageRouter = express.Router();

messageRouter.post("", [authMiddleware], createMessage);
messageRouter.get("/:chatId", [authMiddleware], getChatMessages);
messageRouter.put("/read-by/:chatId", [authMiddleware], updateReadBy);
messageRouter.put(
  "/read-by-receiver/:messageId",
  [authMiddleware],
  readByReceiver,
);

export default messageRouter;
