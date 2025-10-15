import request from "supertest";
import express from "express";
import { afterEach, describe, expect, jest, test } from "@jest/globals";

jest.mock("../../prisma/prismaClient.js", () => {
  return {
    prisma: {
      user: {
        findUnique: jest.fn(),
      },
    },
  };
});

import prisma from "../prisma/prismaClient.js";
import authRouter from "../routes/authRouter.js";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

describe("post register", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("invalid firstname", () => {
    
  })
  test("invalid lastname", () => {

  })
  test("invalid email", () => {

  })
  test("invalid password", () => {

  })
  test("invalid confirmPassword", () => {

  })
})
