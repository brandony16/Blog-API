import prisma from "../prisma/prismaClient.js";

export async function findUserById(id) {
  return await prisma.user.findUnique({
    where: { id: id },
  });
}
export async function findUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email: email },
  });
}

export async function getAllUsers() {
  return await prisma.user.findMany();
}

export async function addUser(firstName, lastName, email, password) {
  return await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password,
    },
  });
}
