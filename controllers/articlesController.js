import { body } from "express-validator";
import { DEFAULT_LIMIT_ARTICLES } from "../constants.js";
import * as articleQueries from "../queries/articleQueries.js";

export async function getArticles(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT_ARTICLES;
    const skip = (page - 1) * limit; // Number of entries to skip to get correct page

    // Get users and total number of users
    const [articles, total] = await Promise.all([
      articleQueries.getManyArticles(skip, limit),
      articleQueries.getArticleCount(),
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    console.error(`Error fetching users: ${err}`);
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
  async (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

    try {
      const { title, body, publishArticle } = matchedData(req);
      await articleQueries.createArticle(
        title,
        body,
        req.user.id,
        publishArticle
      );

      res.status(201).json({
        message: "Article created successfully",
      });
    } catch (err) {
      next(err);
    }
  },
];

export async function getArticle(req, res) {}

export async function editArticle(req, res) {}

export async function deleteArticle(req, res) {}

export async function publishArticle(req, res) {}

export async function getArticleComments(req, res) {}

export async function postComment(req, res) {}
