import { Role } from "@prisma/client";
import prisma from "../prisma/prismaClient.js";
import { DEFAULT_LIMIT_COMMENTS } from "./constants.js";

export async function getComments(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT_COMMENTS;
    const skip = (page - 1) * limit; // Number of entries to skip to get correct page

    // Get all comments and the total number of comments
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        skip: skip,
        take: limit,
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          text: true,
          createdAt: true,
          editedAt: true,
        },
      }),
      prisma.comment.count({
        where: { deletedAt: null },
      }),
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      comments,
    });
  } catch (err) {
    console.error(`Error fetching comments: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}

export async function editComment(req, res) {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    // Validate comment exists and that the user has permission to edit it
    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (existingComment.commenterId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this comment" });
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: { text: content, editedAt: new Date() },
    });

    return res.json(updatedComment);
  } catch (err) {
    console.error(`Error updating comment: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}

export async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;

    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    // Verify comment exists and confirm that user has permission to delete the comment
    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (
      existingComment.commenterId !== req.user.id &&
      req.user.role !== Role.ADMIN
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this comment" });
    }

    const deletedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return res.json(deletedComment);
  } catch (err) {
    console.error(`Error deleting comment: ${err}`);
    res.status(500).json({ error: "Internal Service Error" });
  }
}
