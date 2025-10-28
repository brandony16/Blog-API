import * as dotenv from "dotenv";
import express from "express";
import authRouter from "./routes/authRouter.js";
import usersRouter from "./routes/usersRouter.js";
import articlesRouter from "./routes/articlesRouter.js";
import commentsRouter from "./routes/commentsRouter.js";
import passport from "./auth/passport.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);

app.listen(process.env.PORT, (err) => {
  if (err) throw err;

  console.log(`App running on port ${process.env.PORT}`);
});
