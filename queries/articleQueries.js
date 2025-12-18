import prisma from "../prisma/prismaClient.js";

const ARTICLE_FIELDS = {
  id: true,
  title: true,
  body: true,
  createdAt: true,
  publishedAt: true,
  editedAt: true,
  authorId: true,
};

const EXTENDED_INFO = {
  ...ARTICLE_FIELDS,
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
};

// ----- COUNTS -----
export async function getArticleCount(search) {
  return await prisma.article.count({
    where: {
      deletedAt: null,
      isPublished: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { body: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
  });
}

export async function getArticleCountByUser(userId) {
  return await prisma.article.count({
    where: {
      authorId: parseInt(userId),
      deletedAt: null,
    },
  });
}

export async function getDraftCountByUser(userId) {
  return await prisma.article.count({
    where: {
      authorId: parseInt(userId),
      isPublished: false,
      deletedAt: null,
    },
  });
}

export async function getPublishedCountByUser(userId) {
  return await prisma.article.count({
    where: {
      authorId: parseInt(userId),
      isPublished: true,
      deletedAt: null,
    },
  });
}

// ----- SINGLE ARTICLE -----
export async function fetchArticleAdmin(articleId) {
  return await prisma.article.findUnique({
    where: {
      deletedAt: null,
      id: articleId,
    },
    select: EXTENDED_INFO,
  });
}

export async function fetchArticleClient(articleId) {
  return await prisma.article.findUnique({
    where: {
      deletedAt: null,
      isPublished: true,
      id: articleId,
    },
    select: EXTENDED_INFO,
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

export async function updateArticle(articleId, title, body, publish) {
  return await prisma.article.update({
    where: {
      id: articleId,
      deletedAt: null,
    },
    data: {
      title,
      body,
      editedAt: new Date(),
      isPublished: publish,
      publishedAt: publish ? new Date() : null,
    },
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
export async function getManyArticles(skip, limit, search) {
  return await prisma.article.findMany({
    where: {
      deletedAt: null,
      isPublished: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { body: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    skip: skip,
    take: limit,
    orderBy: { publishedAt: "desc" },
    select: EXTENDED_INFO,
  });
}

export async function getArticlesByUser(userId, skip, limit, orderBy) {
  return await prisma.article.findMany({
    where: {
      authorId: parseInt(userId),
      deletedAt: null,
    },
    skip: skip,
    take: limit,
    orderBy: orderBy,
    select: ARTICLE_FIELDS,
  });
}
