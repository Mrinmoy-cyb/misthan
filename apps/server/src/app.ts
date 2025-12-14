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
import express, { type Express } from "express";
import authRouter from "@/routes/auth";

// Create the Express app and register core middleware
const app: Express = express()
  // Parse incoming JSON request bodies
  .use(express.json())
  // Mount authentication routes under `/api/auth`
  .use("/api/auth", authRouter)
  // Simple health route / sanity check
  .get("/", (_req, res) => {
    res.send("Hello, World!");
  });


// Generic JSON error handler for API routes. This ensures we consistently
// return JSON error responses instead of the default HTML error page.
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export { app };
