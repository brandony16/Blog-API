import prisma from "../prisma/prismaClient.js";

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id: id },
  });
}
export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email: email },
  });
}

export async function getAllUsers() {
  return prisma.user.findMany();
}

export async function addUser(firstName, lastName, email, password) {
  prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password,
    },
  });
}
