import signin from "../controllers/auth/signin";
import signup from "../controllers/auth/signup";
import express from "express";

const authRouter = express.Router();

authRouter.post("/signin", signin);
authRouter.post("/signup", signup);

export default authRouter;
