import rateLimiter from "@/common/middleware/rateLimiter";
import { env } from "@/common/utils/envConfig";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

export const middlewareConfig = (app: Express) => {
  // set the application to trust the reverse proxy
  app.set("trust proxy", true);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(helmet());
  //   only use rate limiter on production
  if (env.NODE_ENV === "production") {
    app.use(rateLimiter);
  }
};
