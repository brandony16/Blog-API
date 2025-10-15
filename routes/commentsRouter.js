import { Router } from "express";
import * as commentsController from "../controllers/commentsController";

// Primarily used for editing and deleting already existing comments
const commentsRouter = Router();

commentsRouter.get("/", commentsController.getComments);

commentsRouter.put("/:commentId", commentsController.editComment);

commentsRouter.delete("/:commentId", commentsController.deleteComment);

export default commentsRouter;
