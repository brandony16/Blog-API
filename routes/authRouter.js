import { Router } from "express";
import * as authController from "../controllers/authController";

// Authenticates users
const authRouter = Router();

authRouter.post("/register", authController.register);

authRouter.post("/login", authController.login);

authRouter.post("/logout", authController.logout);

export default authRouter;
