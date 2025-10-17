import prisma from "../prisma/prismaClient.js";

const ARTICLE_FIELDS = {
  id: true,
  title: true,
  body: true,
  createdAt: true,
  editedAt: true,
};

export async function getArticleCountByUser(userId) {
  return await prisma.article.count({
    where: {
      authorId: parseInt(userId),
      deletedAt: null,
      isPublished: true,
    },
  });
}

export async function getArticlesByUser(userId, skip, limit) {
  return await prisma.article.findMany({
    where: {
      authorId: parseInt(userId),
      deletedAt: null,
      isPublished: true,
    },
    skip: skip,
    take: limit,
    orderBy: { publishedAt: "desc" },
    select: ARTICLE_FIELDS,
  });
}
