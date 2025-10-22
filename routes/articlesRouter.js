import { Router } from "express";
import * as articlesController from "../controllers/articlesController.js";
import { requireRole, verifyToken } from "../middleware/authMiddleware.js";
import { Role } from "@prisma/client";

// Routes to everything needed for articles, including specific articles and comments.
const articlesRouter = Router();

articlesRouter.get("/", articlesController.getArticles);

articlesRouter.post(
  "/",
  verifyToken,
  verifyToken(Role.ADMIN),
  articlesController.postArticle
);

articlesRouter.get("/:articleId", articlesController.getArticle);

articlesRouter.put(
  "/:articleId",
  verifyToken,
  requireRole(Role.ADMIN),
  articlesController.editArticle
);

articlesRouter.delete(
  "/:articleId",
  verifyToken,
  articlesController.deleteArticle
);

articlesRouter.post(
  "/:articleId/publish",
  verifyToken,
  requireRole(Role.ADMIN),
  articlesController.publishArticle
);

articlesRouter.get(
  "/:articleId/comments",
  verifyToken,
  articlesController.getArticleComments
);

articlesRouter.post("/:articleId/comments", articlesController.postComment);

export default articlesRouter;
