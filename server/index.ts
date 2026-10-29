import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

// Load environment variables from possible locations
const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "rhy-bistro-web/server/.env"),
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}
dotenv.config();

import app from "./app.js";
import { connectDB } from "./lib/db.js";
import { logger } from "./lib/logger.js";

const rawPort = process.env["PORT"] || "3001";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function startServer() {
  try {
    logger.info("Connecting to MongoDB...");
    await connectDB();

    app.listen(port, "0.0.0.0", () => {
      logger.info({ port }, `RHY Bistro API Server listening on http://0.0.0.0:${port}`);
    });
  } catch (err) {
    logger.error({ err }, "Failed to start API server");
    process.exit(1);
  }
}

startServer();
