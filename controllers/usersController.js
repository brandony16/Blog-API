import {
  DEFAULT_LIMIT_ARTICLES,
  DEFAULT_LIMIT_COMMENTS,
  DEFAULT_LIMIT_USERS,
} from "../constants.js";
import * as articleQueries from "../queries/articleQueries.js";
import * as commentQueries from "../queries/commentQueries.js";
import * as userQueries from "../queries/userQueries.js";

export async function getUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT_USERS;
    const skip = (page - 1) * limit; // Number of entries to skip to get correct page

    // Get users and total number of users
    const [users, total] = await Promise.all([
      userQueries.getManyUsers(skip, limit),
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

export async function editUser(req, res) {
  const { userId } = req.params;
  const data = req.body;

  try {
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

    const editableFields = ["firstName", "lastName"];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => editableFields.includes(key))
    );

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No editable fields provided" });
    }

    // Update user
    const updatedUser = await userQueries.updateUser(userId, updateData);

    return res.json({ user: updatedUser });
  } catch (err) {
    console.error(`Error editing user: ${err}`);
    res.status(500).json({ message: "Internal Service Error" });
  }
}

export async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    const existingUser = userQueries.findUserById(userId);

    // Verify the given user exists and that the user has permission to delete the user
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (existingUser.id !== req.user.id && req.user.role !== Role.ADMIN) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this user" });
    }

    const deletedUser = await userQueries.removeUser(userId);

    return res.json(deletedUser);
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
