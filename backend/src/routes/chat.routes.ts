import express from "express";
import authMiddleware from "../middlewares/auth";
import createChatController from "../controllers/chat/create-one-on-one-chat";
import createGroupChatController from "../controllers/chat/create-group-chat";
import getChatController from "../controllers/chat/get-chat";
import getUserChatsController from "../controllers/chat/get-user-chats";
import {
  addToGroupController,
  removeFromGroupController,
  renameGroupController,
} from "../controllers/chat/group-actions";

const router = express.Router();

router.post("/one-on-one", [authMiddleware], createChatController);
router.post("/group", [authMiddleware], createGroupChatController);
router.put("/group/add", [authMiddleware], addToGroupController);
router.put("/group/remove", [authMiddleware], removeFromGroupController);
router.put("/group/rename", [authMiddleware], renameGroupController);
router.get("/:chatId", [authMiddleware], getChatController);
router.get("", [authMiddleware], getUserChatsController);

export default router;
