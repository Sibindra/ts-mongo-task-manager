import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { userRouter } from "@/api/user/userRouter";
import type { Express } from "express";

export const routerConfig = (app: Express) => {
  app.use("/health-check", healthCheckRouter);
  app.use("/users", userRouter);
};
