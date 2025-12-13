import express, { type Express } from "express";

const app: Express = express()
  .use(express.json())
  .get("/", (_req, res) => {
    res.send("Hello, World!");
  });

export { app };
