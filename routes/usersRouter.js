import { Router } from "express";
import * as usersController from "../controllers/usersController";

// Gets user information for profiles
const usersRouter = Router();

usersRouter.get("/", usersController.getUsers);

usersRouter.get("/:userId", usersController.getUser);

usersRouter.put("/:userId", usersController.editUser);

usersRouter.delete("/:userId", usersController.deleteUser);

usersRouter.get("/:userId/comments", usersController.getUserComments);

usersRouter.get("/:userId/articles", usersController.getUserArticles);

export default usersRouter;
