import prisma from "../prisma/prismaClient.js";
import {
  DEFAULT_LIMIT_ARTICLES,
  DEFAULT_LIMIT_COMMENTS,
  DEFAULT_LIMIT_USERS,
  DEFAULT_TAKE,
} from "./constants.js";

export async function getUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT_USERS;
    const skip = (page - 1) * limit; // Number of entries to skip to get correct page

    // Get users and total number of users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({
        where: { deletedAt: null },
      }),
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

export async function getUser(req, res) {
  try {
    const { userId } = req.params;

    // Get the user and some of their articles and comments
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        articles: {
          take: DEFAULT_TAKE,
          where: { isPublished: true, deletedAt: null },
          select: {
            id: true,
            title: true,
            publishedAt: true,
          },
        },
        comments: {
          take: DEFAULT_TAKE,
          where: { deletedAt: null },
          select: {
            id: true,
            text: true,
            createdAt: true,
            article: { select: { title: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "No user found" });
    }

    return res.json({
      user,
    });
  } catch (err) {
    console.error(`Error fetching user: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}

export async function editUser(req, res) {
  const { userId } = req.params;
  const data = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    // Verify this user exists and that the user has permission to edit this user
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (existingUser.id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this user" });
    }

    const editableFields = ["firstName", "lastName"];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => editableFields.includes(key))
    );

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No editable fields provided" });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return res.json({ user: updatedUser });
  } catch (err) {
    console.error(`Error editing user: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}

export async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    // Verify the given user exists and that the user has permission to delete the user
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (existingUser.id !== req.user.id && req.user.role !== Role.ADMIN) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this user" });
    }

    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return res.json(deletedUser);
  } catch (err) {
    console.error(`Error deleting user: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}

export async function getUserArticles(req, res) {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT_ARTICLES;
    const skip = (page - 1) * limit;

    // Get all articles and the total number of articles for this user
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          authorId: parseInt(userId),
          deletedAt: null,
          isPublished: true,
        },
        skip: skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          body: true,
          publishedAt: true,
          editedAt: true,
        },
      }),
      prisma.article.count({
        where: {
          authorId: parseInt(userId),
          deletedAt: null,
          isPublished: true,
        },
      }),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      articles,
    });
  } catch (err) {
    console.error(`Error getting articles for user: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
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
      prisma.comment.findMany({
        where: {
          commenterId: parseInt(userId),
          deletedAt: null,
        },
        skip: skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          text: true,
          createdAt: true,
          editedAt: true,
        },
      }),
      prisma.comment.count({
        where: {
          commenterId: parseInt(userId),
          deletedAt: null,
        },
      }),
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
    res.status(500).json({ error: "Internal Service Error" });
  }
}
