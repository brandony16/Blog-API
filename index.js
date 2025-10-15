import express from "express";
import * as dotenv from "dotenv";
import authRouter from "./routes/authRouter";
import usersRouter from "./routes/usersRouter";
import articlesRouter from "./routes/articlesRouter";
import commentsRouter from "./routes/commentsRouter";

dotenv.config();

const app = express();

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);

app.listen(process.env.PORT, (err) => {
  if (err) throw err;

  console.log(`App running on port ${process.env.PORT}`);
});
