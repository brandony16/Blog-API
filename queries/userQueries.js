import { DEFAULT_TAKE } from "../constants.js";
import prisma from "../prisma/prismaClient.js";

const SAFE_USER_INFO = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
};

export async function getUserCount() {
  return await prisma.user.count({
    where: { deletedAt: null },
  });
}

// ----- SINGLE USER -----

export async function findUserById(id) {
  return await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: SAFE_USER_INFO,
  });
}
export async function findUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email: email },
    select: SAFE_USER_INFO,
  });
}
export async function findUserForAuth(email) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function addUser(firstName, lastName, email, password, role) {
  return await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password,
      role,
    },
    select: SAFE_USER_INFO,
  });
}

export async function updateUser(userId, updateData) {
  return await prisma.user.update({
    where: { id: parseInt(userId) },
    data: updateData,
    select: {
      ...SAFE_USER_INFO,
      email: true,
    },
  });
}

export async function removeUser(userId) {
  return await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { deletedAt: new Date() },
    select: {
      ...SAFE_USER_INFO,
      email: true,
    },
  });
}

export async function getUserAndProfile(userId) {
  return await prisma.user.findUnique({
    where: { id: parseInt(userId), deletedAt: null },
    select: {
      ...SAFE_USER_INFO,
      articles: {
        take: DEFAULT_TAKE,
        where: { isPublished: true, deletedAt: null },
        select: {
          id: true,
          title: true,
          publishedAt: true,
          editedAt: true,
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
}

// ----- MULTIPLE USERS -----
export async function getManyUsers(skip, limit, orderObj) {
  return await prisma.user.findMany({
    skip: skip,
    take: limit,
    select: { ...SAFE_USER_INFO, email: true, createdAt: true },
    where: { deletedAt: null },
    orderBy: orderObj,
  });
}
