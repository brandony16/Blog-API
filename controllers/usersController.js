import { Role } from "@prisma/client";
import {
  DEFAULT_LIMIT_ARTICLES,
  DEFAULT_LIMIT_COMMENTS,
  DEFAULT_LIMIT_USERS,
} from "../constants.js";
import * as articleQueries from "../queries/articleQueries.js";
import * as commentQueries from "../queries/commentQueries.js";
import * as userQueries from "../queries/userQueries.js";
import { body, matchedData, validationResult } from "express-validator";

export async function getUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT_USERS;
    const skip = (page - 1) * limit; // Number of entries to skip to get correct page
    const sort = req.query.sort || "lastUpdated";
    const order = req.query.order || "desc";

    const sortMap = {
      name: "firstName",
      email: "email",
      role: "role",
      created: "createdAt",
    };

    const orderObj = { [sortMap[sort]]: order };

    // Get users and total number of users
    const [users, total] = await Promise.all([
      userQueries.getManyUsers(skip, limit, orderObj),
      userQueries.getUserCount(),
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
    res.status(500).json({ message: "Internal Service Error" });
  }
}

export async function getUsersCount(req, res) {
  try {
    const total = await userQueries.getUserCount();

    return res.json({
      total,
    });
  } catch (err) {
    console.error(`Error fetching users: ${err}`);
    res.status(500).json({ message: "Internal Service Error" });
  }
}

export async function getUser(req, res) {
  try {
    const { userId } = req.params;

    // Get the user and some of their articles and comments
    const user = await userQueries.getUserAndProfile(userId);

    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    return res.json({
      user,
    });
  } catch (err) {
    console.error(`Error fetching user: ${err}`);
    res.status(500).json({ message: "Internal Service Error" });
  }
}

const alphaErr = "must contain only letters.";
const lengthErr = "must be between 1 and 30 characters.";
const validateEdit = [
  body("firstName")
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 30 })
    .withMessage(`First name ${lengthErr}`),
  body("lastName")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 30 })
    .withMessage(`Last name ${lengthErr}`),
];
export const editUser = [
  validateEdit,
  async (req, res) => {
    const { userId } = req.params;
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

    try {
      const { firstName, lastName } = matchedData(req);
      const existingUser = await userQueries.findUserById(userId);

      // Verify this user exists and that the user has permission to edit this user
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (existingUser.id !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Not authorized to edit this user" });
      }

      // Update user
      const updatedUser = await userQueries.updateUser(userId, {
        firstName,
        lastName,
      });

      return res.json({ message: "User updated", user: updatedUser });
    } catch (err) {
      console.error(`Error editing user: ${err}`);
      res.status(500).json({ message: "Internal Service Error" });
    }
  },
];

export async function promoteUser(req, res) {
  const { userId } = req.params;
  try {
    const existingUser = await userQueries.findUserById(userId);

    // Verify this user exists and that the user has permission to promote this user
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = { role: Role.ADMIN };
    const updatedUser = await userQueries.updateUser(userId, updateData);

    return res.json({ message: "User promoted", user: updatedUser });
  } catch (err) {
    console.error(`Error editing user: ${err}`);
    res.status(500).json({ message: "Internal Service Error" });
  }
}

export async function deleteUser(req, res) {
  try {
    const { userId } = req.params;
    const id = parseInt(userId);
    const existingUser = userQueries.findUserById(id);

    // Verify the given user exists and that the user has permission to delete the user
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (existingUser.id !== req.user.id && req.user.role !== Role.ADMIN) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this user" });
    }

    const deletedUser = await userQueries.removeUser(id);

    return res.json({
      message: "User successfully deleted",
      user: deletedUser,
    });
  } catch (err) {
    console.error(`Error deleting user: ${err}`);
    res.status(500).json({ message: "Internal Service Error" });
  }
}

export async function getUserArticles(req, res) {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT_ARTICLES;
    const sort = req.query.sort || "lastUpdated";
    const order = req.query.order || "desc";
    const skip = (page - 1) * limit;

    const sortMap = {
      title: "title",
      status: "publishedAt",
      lastUpdated: "publishedAt",
    };

    const orderObj = { [sortMap[sort]]: order };

    // Get all articles and the total number of articles for this user
    let [articles, total] = await Promise.all([
      articleQueries.getArticlesByUser(userId, skip, limit, orderObj),
      articleQueries.getArticleCountByUser(userId),
    ]);

    if (sort === "lastUpdated") {
      articles = articles.sort((a, b) => {
        const aTime = Math.max(
          new Date(a.createdAt),
          new Date(a.publishedAt),
          new Date(a.editedAt)
        );
        const bTime = Math.max(
          new Date(b.createdAt),
          new Date(b.publishedAt),
          new Date(b.editedAt)
        );
        return order === "asc" ? aTime - bTime : bTime - aTime;
      });
    }

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      articles,
    });
  } catch (err) {
    console.error(`Error getting articles for user: ${err}`);
    res.status(500).json({ message: "Internal Service Error" });
  }
}

export async function getUserComments(req, res) {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT_COMMENTS;
    const skip = (page - 1) * limit;

    // Get all comments and the total number of comments from this user
    const [comments, total] = await Promise.all([
      commentQueries.getCommentsByUser(userId, skip, limit),
      commentQueries.getCommentCountByUser(userId),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      comments,
    });
  } catch (err) {
    console.error(`Error getting comments for user: ${err}`);
    res.status(500).json({ message: "Internal Service Error" });
  }
}

export async function getUserArticleCounts(req, res) {
  try {
    const { userId } = req.params;
    const id = parseInt(userId);

    const [drafts, published, total] = await Promise.all([
      articleQueries.getDraftCountByUser(id),
      articleQueries.getPublishedCountByUser(id),
      articleQueries.getArticleCountByUser(id),
    ]);

    res.json({
      drafts,
      published,
      total,
    });
  } catch (err) {
    console.error(`Error getting article counts for user: ${err}`);
    res.status(500).json({ message: "Internal Service Error" });
  }
}
