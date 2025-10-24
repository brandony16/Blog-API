import prisma from "../prisma/prismaClient.js";

const ARTICLE_FIELDS = {
  id: true,
  title: true,
  body: true,
  createdAt: true,
  editedAt: true,
};

// ----- COUNTS -----
export async function getArticleCount() {
  return await prisma.article.count({
    where: {
      deletedAt: null,
      isPublished: true,
    },
    select: ARTICLE_FIELDS,
  });
}

export async function getArticleCountByUser(userId) {
  return await prisma.article.count({
    where: {
      authorId: parseInt(userId),
      deletedAt: null,
      isPublished: true,
    },
    select: ARTICLE_FIELDS,
  });
}

// ----- SINGLE ARTICLE -----
export async function fetchArticle(articleId) {
  return await prisma.article.findUnique({
    where: {
      deletedAt: null,
      isPublished: true,
      id: articleId,
    },
    select: ARTICLE_FIELDS,
  });
}

export async function createArticle(title, body, authorId, publishArticle) {
  return await prisma.article.create({
    data: {
      title,
      body,
      authorId,
      isPublished: publishArticle,
      publishedAt: publishArticle ? new Date() : null,
    },
    select: ARTICLE_FIELDS,
  });
}

export async function updateArticle(articleId, title, body) {
  return await prisma.article.update({
    where: {
      id: articleId,
      deletedAt: null,
    },
    data: { title, body, editedAt: new Date() },
    select: ARTICLE_FIELDS,
  });
}

export async function removeArticle(articleId) {
  return await prisma.article.update({
    where: {
      id: articleId,
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
    select: ARTICLE_FIELDS,
  });
}

export async function publish(articleId) {
  return await prisma.article.update({
    where: {
      id: articleId,
      deletedAt: null,
    },
    data: { publishedAt: new Date(), isPublished: true },
    select: ARTICLE_FIELDS,
  });
}

// ----- MULTIPLE ARTICLES -----
export async function getManyArticles(skip, limit) {
  return await prisma.article.findMany({
    where: {
      deletedAt: null,
      isPublished: true,
    },
    skip: skip,
    take: limit,
    orderBy: { publishedAt: "desc" },
    select: ARTICLE_FIELDS,
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
