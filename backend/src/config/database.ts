/**
 * @file src/config/database.ts
 * @description MongoDB connection management via Mongoose.
 *
 * Handles:
 *  - Initial connection with retry logic
 *  - Graceful disconnect on SIGINT / SIGTERM
 *  - Connection event logging
 */

import mongoose from "mongoose";
import { logger } from "../utils/logger";
import { MONGODB_URI } from "./env";

/** Maximum number of initial connection retries */
const MAX_RETRIES = 5;
/** Delay (ms) between each retry attempt */
const RETRY_DELAY_MS = 3000;

/**
 * Establishes a MongoDB connection.
 * Retries up to MAX_RETRIES times before giving up.
 */
export async function connectDatabase(attempt = 1): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, {
      // Use the new URL parser & unified topology by default in Mongoose 7+
      serverSelectionTimeoutMS: 5000, // fail fast during startup
      socketTimeoutMS: 45000,
    });

    logger.info(`[Database] Connected to MongoDB (attempt ${attempt})`);

    // -----------------------------------------------------------------------
    // Connection lifecycle events
    // -----------------------------------------------------------------------
    mongoose.connection.on("disconnected", () => {
      logger.warn("[Database] MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("[Database] MongoDB reconnected");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("[Database] MongoDB error:", err);
    });
  } catch (error) {
    logger.error(`[Database] Connection failed (attempt ${attempt}):`, error);

    if (attempt < MAX_RETRIES) {
      logger.info(
        `[Database] Retrying in ${RETRY_DELAY_MS / 1000}s… (${attempt}/${MAX_RETRIES})`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDatabase(attempt + 1);
    }

    logger.error("[Database] Max retries reached. Exiting.");
    process.exit(1);
  }
}

/**
 * Gracefully closes the MongoDB connection.
 * Called during application shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.info("[Database] MongoDB connection closed");
  } catch (error) {
    logger.error("[Database] Error closing MongoDB connection:", error);
  }
}
