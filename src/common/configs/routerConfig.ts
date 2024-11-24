import { authRouter } from "@/api/auth/authRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { orderRouter } from "@/api/order/orderRouter";
import { productRouter } from "@/api/product/productRouter";
import { userRouter } from "@/api/user/userRouter";
import type { Express } from "express";

export const routerConfig = (app: Express) => {
  app.use("/health-check", healthCheckRouter);
  app.use("/users", userRouter);
  app.use("/auth", authRouter);
  app.use("/products", productRouter);
  app.use("/orders", orderRouter);
};
