import prisma from "../prisma/prismaClient.js";

export async function getComments(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit; // Number of entries to skip to get correct page

    const comments = await prisma.comment.findMany({
      skip: skip,
      take: limit,
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.comment.count({
      where: { deletedAt: null },
    });

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      comments,
    });
  } catch (err) {
    console.error(`Error updating comment: ${err}`);
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

    if (!existingComment) {
      return res.status(400).json({ error: "Comment not found" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: { text: content },
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
