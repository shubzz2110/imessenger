import { logger } from "../utils/logger";
import cors from "cors";

const ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:4000"];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
    }
  },
  credentials: true, // allow cookies / Authorization header
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Request-Id"],
  maxAge: 86400, // preflight result cached for 24 h
};

export default corsOptions;
