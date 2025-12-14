/**
 * Server entrypoint
 *
 * Bootstraps the HTTP server by importing the configured Express `app`
 * and binding it to the desired port. This file is intentionally small
 * so tests can import `app` directly without starting a listener.
 */
import { app } from "@/app";

/**
 * The port the server will listen on. Defaults to `3000` when `PORT`
 * is not provided via environment variables.
 */
const PORT = process.env.PORT || 3000;

// Start the HTTP server and log a simple startup message.
app.listen(PORT, () => {
  console.log(`Server is running on port - ${PORT}`);
});
