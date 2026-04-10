/**
 * @file src/utils/logger.ts
 * @description Lightweight, leveled logger.
 *
 * Wraps console methods with:
 *  - ISO timestamps
 *  - Log levels (info, warn, error, debug, http)
 *  - Colour coding in development
 *  - Silent mode in tests
 *
 * Swap for Winston / Pino in larger projects by replacing the
 * underlying calls here – all import sites stay the same.
 */

import { IS_PRODUCTION, IS_TEST } from "../config/env";

// ---------------------------------------------------------------------------
// ANSI colour helpers (only applied in development for readability)
// ---------------------------------------------------------------------------
const RESET = "\x1b[0m";
const COLOURS = {
  info: "\x1b[36m", // cyan
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
  debug: "\x1b[35m", // magenta
  http: "\x1b[32m", // green
} as const;

type LogLevel = keyof typeof COLOURS;

function timestamp(): string {
  return new Date().toISOString();
}

function format(level: LogLevel, message: string): string {
  const colour = IS_PRODUCTION ? "" : COLOURS[level];
  const reset = IS_PRODUCTION ? "" : RESET;
  const tag = `[${level.toUpperCase()}]`.padEnd(8);
  return `${colour}${timestamp()} ${tag} ${message}${reset}`;
}

// ---------------------------------------------------------------------------
// Public logger interface
// ---------------------------------------------------------------------------
export const logger = {
  info(message: string, ...args: unknown[]): void {
    if (IS_TEST) return;
    console.info(format("info", message), ...args);
  },

  warn(message: string, ...args: unknown[]): void {
    if (IS_TEST) return;
    console.warn(format("warn", message), ...args);
  },

  error(message: string, ...args: unknown[]): void {
    if (IS_TEST) return;
    console.error(format("error", message), ...args);
  },

  debug(message: string, ...args: unknown[]): void {
    if (IS_TEST || IS_PRODUCTION) return;
    console.debug(format("debug", message), ...args);
  },

  /** Used by the Morgan HTTP middleware */
  http(message: string): void {
    if (IS_TEST) return;
    process.stdout.write(format("http", message) + "\n");
  },
};
