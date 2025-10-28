import { body, matchedData, validationResult } from "express-validator";
import * as userQueries from "../queries/userQueries.js";
import bcrypt from "bcrypt";
import passport from "../auth/passport.js";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const alphaErr = "must contain only letters.";
const lengthErr = "must be between 1 and 30 characters.";

const validateUser = [
  body("firstName")
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 30 })
    .withMessage(`First name ${lengthErr}`),
  body("lastName")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 30 })
    .withMessage(`Last name ${lengthErr}`),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format.")
    .custom(async (email) => {
      const user = await userQueries.findUserByEmail(email);
      if (user) throw new Error("Email already in use");
    }),
  body("password")
    .trim()
    .isLength({ min: 4, max: 64 })
    .withMessage("Password should be between 4 and 64 characters"),
  body("confirmPassword")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords should match"),
];

export const register = [
  validateUser,
  async (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

    try {
      const { firstName, lastName, email, password } = matchedData(req);
      const hashedPassword = await bcrypt.hash(password, 10);

      await userQueries.addUser(
        firstName,
        lastName,
        email,
        hashedPassword,
        Role.CLIENT
      );

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(201).json({
        message: "User registered successfully",
        token: token,
        user: { id: user.id, email: user.email, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  },
];

const validateAdmin = [
  ...validateUser,
  body("secret-password").equals(process.env.ADMIN_SECRET),
];
export const registerAdmin = [
  validateAdmin,
  async (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

    try {
      const { firstName, lastName, email, password } = matchedData(req);
      const hashedPassword = await bcrypt.hash(password, 10);

      await userQueries.addUser(
        firstName,
        lastName,
        email,
        hashedPassword,
        Role.ADMIN
      );

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(201).json({
        message: "User registered successfully",
        token: token,
        user: { id: user.id, email: user.email, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  },
];

export function login(req, res, next) {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "Login Successful",
      token: token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  })(req, res, next);
}
