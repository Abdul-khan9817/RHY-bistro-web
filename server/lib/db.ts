import mongoose from "mongoose";
import { logger } from "./logger.js";

mongoose.connection.on("connected", () => {
  logger.info("MongoDB connection established");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected — attempting to reconnect");
});

mongoose.connection.on("error", (err: Error) => {
  logger.error({ err }, "MongoDB connection error");
});

export async function connectDB(): Promise<void> {
  const uri = process.env["MONGODB_URI"] || "mongodb://127.0.0.1:27017/rhy-bistro";
  const dbName = process.env["DB_NAME"] ?? "rhy-bistro";

  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 4000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 10,
    });
    logger.info(`MongoDB connected successfully to ${uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`);
  } catch (err) {
    // If local MongoDB is not running in dev mode, seamlessly fallback to in-memory MongoDB
    const isDev = process.env["NODE_ENV"] !== "production";
    const isLocalhost = uri.includes("localhost") || uri.includes("127.0.0.1");

    if (isDev && isLocalhost) {
      logger.warn(
        "Local MongoDB instance not reachable on port 27017. Starting MongoMemoryServer for development preview...",
      );
      try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri, {
          dbName,
          serverSelectionTimeoutMS: 5000,
        });
        logger.info({ memUri }, "Connected to in-memory MongoDB development instance");
        return;
      } catch (memErr) {
        logger.error({ memErr }, "Failed to initialize in-memory MongoDB");
      }
    }

    throw err;
  }
}

export default mongoose;
