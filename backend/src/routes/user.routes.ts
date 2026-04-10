import authMiddleware from "../middlewares/auth";
import getUserController from "../controllers/user/get";
import express from "express";

const userRouter = express.Router();

userRouter.get("", [authMiddleware], getUserController);

export default userRouter;
