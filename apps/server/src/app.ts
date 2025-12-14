/**
 * Express application setup
 *
 * This module constructs and exports the shared Express `app` used
 * by the server. It centralizes middleware, route mounting, and a
 * lightweight JSON error handler so tests and the application can
 * import the same instance.
 *
 * Notes:
 * - Keep router registration and global middleware here to make the
 *   application shape easy to test (for example, supertest importing
 *   `app` directly).
 * - The error handler returns JSON rather than HTML stack traces,
 *   which is more suitable for API clients and tests.
 */
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import authRouter from "@/routes/auth";
import sweetsRouter from "@/routes/sweets";
import categoryRouter from "@/routes/category";
import path from "path";
import { access } from "fs";

// Create the Express app and register core middleware
const app: Express = express()
  .use(express.json()) // Parse incoming JSON request bodies
  .use("/api/auth", authRouter) // Mount authentication routes under `/api/auth`
  .use("/api/sweets", sweetsRouter) // Mount sweets routes under `/api/sweets`
  .use("/api/category", categoryRouter); // Mount category routes under `/api/category`

/**
 * Generic JSON error handler.
 *
 * Ensures all unexpected errors are returned as JSON instead of HTML pages.
 * Logs the error to stderr and responds with a standard 500 payload.
 *
 * Note: Place after all route registrations so it can catch downstream errors.
 */
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // Basic logging for visibility during development/tests
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.use((req, res) => {
  const filePath = path.join(
    __dirname,
    "apps\\frontend\\dist\\index.html",
    "index.html",
  );

  access(filePath, (err) => {
    if (err) {
      return res.status(404).json({ error: "Not Found" });
    } else {
      return res.sendFile(filePath);
    }
  });
});

export { app };
