import dotenv from "dotenv";
dotenv.config();

export const FRONTEND_URL = process.env.FRONTEND_URL!;
export const MONGODB_URI = process.env.MONGODB_URI!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const REDIS_HOST = process.env.REDIS_HOST!;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT!, 10);
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_TEST = process.env.NODE_ENV === "test";
export const NODE_ENV: "production" | "development" =
  (process.env.NODE_ENV as "production" | "development") || "development";
export const PORT = parseInt(process.env.PORT || "4000", 10);

if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL is not defined in environment variables");
}
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
if (!REDIS_HOST) {
  throw new Error("REDIS_HOST is not defined in environment variables");
}
if (!REDIS_PORT) {
  throw new Error("REDIS_PORT is not defined in environment variables");
}
if (!REDIS_PASSWORD) {
  throw new Error("REDIS_PASSWORD is not defined in environment variables");
}
if (!NODE_ENV) {
  throw new Error("NODE_ENV is not defined in environment variables");
}
if (!PORT) {
  throw new Error("PORT is not defined in environment variables");
}
