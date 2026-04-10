/**
 * @file src/middlewares/requestLogger.ts
 * @description Morgan HTTP request logger configured to write through our
 *              custom logger utility.
 *
 * - Development: concise "dev" format with colours
 * - Production:  combined Apache-style format (suitable for log aggregators)
 */

import morgan, { StreamOptions } from "morgan";
import { logger } from "../utils/logger";
import { IS_PRODUCTION, IS_TEST } from "../config/env";

/** Stream adapter – pipes Morgan output into our logger */
const stream: StreamOptions = {
  write: (message: string) => logger.http(message.trimEnd()),
};

/** Skip logging for tests */
const skip = (): boolean => IS_TEST;

export const requestLogger = morgan(IS_PRODUCTION ? "combined" : "dev", {
  stream,
  skip,
});
