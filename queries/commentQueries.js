import prisma from "../prisma/prismaClient.js";

const COMMENT_FIELDS = {
  id: true,
  text: true,
  createdAt: true,
  editedAt: true,
};

// ----- COMMENT COUNTS -----
export async function getCommentCountByUser(userId) {
  return await prisma.comment.count({
    where: {
      commenterId: userId,
      deletedAt: null,
    },
  });
}

export async function getCommentCountByArticle(articleId) {
  return await prisma.comment.count({
    where: {
      articleId: articleId,
      deletedAt: null,
    },
  });
}

export async function getTotalCommentCount() {
  return await prisma.comment.count({
    where: { deletedAt: null },
  });
}

// ----- SINGLE COMMENT -----
export async function getCommentById(commentId) {
  return await prisma.comment.findUnique({
    where: { id: commentId },
    select: COMMENT_FIELDS,
  });
}

export async function addComment(text, commenterId, articleId) {
  return await prisma.comment.create({
    data: {
      text,
      commenterId,
      articleId,
    },
    select: COMMENT_FIELDS,
  });
}

export async function updateComment(commentId, content) {
  return await prisma.comment.update({
    where: { id: commentId },
    data: { text: content, editedAt: new Date() },
  });
}

export async function removeComment(commentId) {
  return await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });
}

// ----- MULTIPLE COMMENTS -----
export async function getCommentsByUser(userId, skip, limit) {
  return await prisma.comment.findMany({
    where: {
      commenterId: userId,
      deletedAt: null,
    },
    skip: skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: COMMENT_FIELDS,
  });
}

export async function getManyComments(skip, limit) {
  return await prisma.comment.findMany({
    skip: skip,
    take: limit,
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: COMMENT_FIELDS,
  });
}

export async function getCommentsByArticle(articleId, skip, limit) {
  return await prisma.comment.findMany({
    where: { articleId: articleId, deletedAt: null },
    skip: skip,
    take: limit,
    include: {
      commenter: { select: { firstName, lastName } },
    },
    select: COMMENT_FIELDS,
  });
}
