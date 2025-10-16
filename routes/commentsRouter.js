import { Router } from "express";
import * as commentsController from "../controllers/commentsController.js";

// Primarily used for editing and deleting already existing comments
const commentsRouter = Router();

// Gets all comments
commentsRouter.get("/", commentsController.getComments);

// Updates a specific comment
commentsRouter.put("/:commentId", commentsController.editComment);

// Deletes a comment
commentsRouter.delete("/:commentId", commentsController.deleteComment);

export default commentsRouter;
