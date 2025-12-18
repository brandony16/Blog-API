import { body, matchedData, validationResult } from "express-validator";
import { DEFAULT_LIMIT_ARTICLES } from "../constants.js";
import * as articleQueries from "../queries/articleQueries.js";
import * as commentQueries from "../queries/commentQueries.js";

export async function getArticles(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT_ARTICLES;
    const query = req.query.q?.trim() || null;
    const skip = (page - 1) * limit; // Number of entries to skip to get correct page

    // Get articles and total number of articles
    const [articles, total] = await Promise.all([
      articleQueries.getManyArticles(skip, limit, query),
      articleQueries.getArticleCount(query),
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      articles,
    });
  } catch (err) {
    console.error(`Error fetching articles: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}

const validateArticle = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Title must be between 1 and 50 characters.")
    .matches(/^[^<>]*$/)
    .withMessage("Title cannot contain HTML tags."),
  body("body")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Body must be at least 10 characters long"),
  body("publishArticle")
    .optional()
    .isBoolean()
    .withMessage("publishArticle must be a boolean"),
];
export const postArticle = [
  validateArticle,
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

    try {
      const { title, body, publishArticle } = matchedData(req);
      const article = await articleQueries.createArticle(
        title,
        body,
        req.user.id,
        publishArticle
      );

      res.status(201).json({
        message: "Article created successfully",
        article,
      });
    } catch (err) {
      console.error(`Error fetching articles: ${err}`);
      res.status(500).json({ error: "Internal Service Error" });
    }
  },
];

export async function getArticleAdmin(req, res) {
  const { articleId } = req.params;

  try {
    const article = await articleQueries.fetchArticleAdmin(parseInt(articleId));

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    return res.json({
      article,
    });
  } catch (err) {
    console.error(`Error fetching articles: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}

export async function getArticleClient(req, res) {
  const { articleId } = req.params;

  try {
    const article = await articleQueries.fetchArticleClient(
      parseInt(articleId)
    );

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    return res.json({
      article,
    });
  } catch (err) {
    console.error(`Error fetching articles: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}

export const editArticle = [
  validateArticle,
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

    try {
      const { title, body, publishArticle } = matchedData(req);
      const { articleId } = req.params;

      const existingArticle = await articleQueries.fetchArticleAdmin(
        parseInt(articleId)
      );

      // Validate article exists and that the user has permission to edit it
      if (!existingArticle) {
        return res.status(404).json({ error: "Article not found" });
      }
      if (existingArticle.authorId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Not authorized to edit this article" });
      }

      const article = await articleQueries.updateArticle(
        parseInt(articleId),
        title,
        body,
        publishArticle
      );

      res.status(200).json({
        message: "Article updated successfully",
        article,
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Article not found" });
      }

      console.error(`Error updating article: ${err}`);
      res.status(500).json({ error: "Internal Service Error" });
    }
  },
];

export async function deleteArticle(req, res) {
  try {
    const { articleId } = req.params;

    const existingArticle = await articleQueries.fetchArticleAdmin(
      parseInt(articleId)
    );
    if (!existingArticle) {
      return res.status(404).json({ message: "Article not found" });
    }
    if (existingArticle.authorId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this article" });
    }

    const deletedArticle = await articleQueries.removeArticle(
      parseInt(articleId)
    );

    return res.json({
      message: "Successfully deleted article",
      article: deletedArticle,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Article not found" });
    }

    console.error(`Error deleting article: ${err}`);
    res.status(500).json({ message: "Internal Service Error" });
  }
}

export async function publishArticle(req, res) {
  try {
    const { articleId } = req.params;

    const existingArticle = await articleQueries.fetchArticleAdmin(
      parseInt(articleId)
    );
    if (!existingArticle) {
      return res.status(404).json({ error: "Article not found" });
    }
    if (existingArticle.authorId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to publish this article" });
    }

    const publishedArticle = await articleQueries.publish(parseInt(articleId));

    return res.json({
      message: "Successfully published article",
      article: publishedArticle,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Article not found" });
    }

    console.error(`Error publishing article: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}

export async function getArticleComments(req, res) {
  try {
    const { articleId } = req.params;
    const id = parseInt(articleId);

    const comments = await commentQueries.getCommentsByArticle(id);

    return res.json({
      comments,
    });
  } catch (err) {
    console.error(`Error fetching article comments: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}

const validateComment = [
  body("text")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Comment should be between 1 and 255 characters"),
];
export const postComment = [
  validateComment,
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

    try {
      const { articleId } = req.params;
      const { text } = matchedData(req);

      const comment = await commentQueries.addComment(
        text,
        req.user.id,
        parseInt(articleId)
      );

      res.status(201).json({
        message: "Comment posted",
        comment,
      });
    } catch (err) {
      console.error(`Error creating comment: ${err}`);
      res.status(500).json({ error: "Internal Service Error" });
    }
  },
];
