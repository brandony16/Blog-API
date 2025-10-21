import { Router } from "express";
import * as articlesController from "../controllers/articlesController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

// Routes to everything needed for articles, including specific articles and comments.
const articlesRouter = Router();

articlesRouter.get("/", articlesController.getArticles);

articlesRouter.post("/", verifyToken, articlesController.postArticle);

articlesRouter.get("/:articleId", articlesController.getArticle);

articlesRouter.put("/:articleId", articlesController.editArticle);

articlesRouter.delete("/:articleId", articlesController.deleteArticle);

articlesRouter.post("/:articleId/publish", articlesController.publishArticle);

articlesRouter.get(
  "/:articleId/comments",
  articlesController.getArticleComments
);

articlesRouter.post("/:articleId/comments", articlesController.postComment);

export default articlesRouter;
