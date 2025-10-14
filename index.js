import express from "express";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

app.use("/", (req, res) => {
  res.send("Hello world");
});

app.listen(process.env.PORT, (err) => {
  if (err) throw err;

  console.log(`App running on port ${process.env.PORT}`);
});
