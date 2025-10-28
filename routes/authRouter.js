import { Router } from "express";
import * as authController from "../controllers/authController.js";

// Authenticates users
const authRouter = Router();

authRouter.post("/register", authController.register);

authRouter.post("/register-admin", authController.registerAdmin);

authRouter.post("/login", authController.login);

export default authRouter;
