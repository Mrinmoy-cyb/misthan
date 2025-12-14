import express, { type Express } from "express";
import authRouter from "@/routes/auth";

const app: Express = express()
  .use(express.json())
  .use("/api/auth", authRouter)
  .get("/", (_req, res) => {
    res.send("Hello, World!");
  });

export { app };
