import { Router } from "express";
import * as usersController from "../controllers/usersController.js";
import { requireRole, verifyToken } from "../middleware/authMiddleware.js";
import { Role } from "@prisma/client";

// Gets user information for profiles
const usersRouter = Router();

usersRouter.get(
  "/",
  verifyToken,
  requireRole(Role.ADMIN),
  usersController.getUsers
);

usersRouter.get(
  "/counts",
  verifyToken,
  requireRole(Role.ADMIN),
  usersController.getUsersCount
);

usersRouter.get("/:userId", usersController.getUser);

usersRouter.put("/:userId", verifyToken, usersController.editUser);

usersRouter.put("/:userId/promote", verifyToken, requireRole(Role.ADMIN), usersController.editUser);

usersRouter.delete("/:userId", verifyToken, usersController.deleteUser);

usersRouter.get("/:userId/comments", usersController.getUserComments);

usersRouter.get("/:userId/articles", usersController.getUserArticles);

usersRouter.get(
  "/:userId/articles/counts",
  verifyToken,
  requireRole(Role.ADMIN),
  usersController.getUserArticleCounts
);

export default usersRouter;
