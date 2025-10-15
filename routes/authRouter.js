import { Router } from "express";
import * as authController from "../controllers/authController.js";

// Authenticates users
const authRouter = Router();

authRouter.post("/register", authController.register);

authRouter.post("/login", authController.login);

authRouter.post("/logout", authController.logout);

export default authRouter;
