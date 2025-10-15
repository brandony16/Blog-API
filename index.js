import express from "express";
import * as dotenv from "dotenv";
import authRouter from "./routes/authRouter.js";
import usersRouter from "./routes/usersRouter.js";
import articlesRouter from "./routes/articlesRouter.js";
import commentsRouter from "./routes/commentsRouter.js";
import passport from "./auth/passport.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);

app.listen(process.env.PORT, (err) => {
  if (err) throw err;

  console.log(`App running on port ${process.env.PORT}`);
});
