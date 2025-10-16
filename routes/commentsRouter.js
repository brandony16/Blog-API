import { Router } from "express";
import * as commentsController from "../controllers/commentsController.js";
import { requireRole, verifyToken } from "../middleware/authMiddleware.js";
import { Role } from "@prisma/client";

// Primarily used for editing and deleting already existing comments
const commentsRouter = Router();

// Gets all comments
commentsRouter.get(
  "/",
  verifyToken,
  requireRole(Role.ADMIN),
  commentsController.getComments
);

// Updates a specific comment
commentsRouter.put("/:commentId", verifyToken, commentsController.editComment);

// Deletes a comment
commentsRouter.delete(
  "/:commentId",
  verifyToken,
  commentsController.deleteComment
);

export default commentsRouter;
