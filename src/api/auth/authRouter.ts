import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authController } from "@/api/auth/authController";
import {
  LoginResponseSchema,
  LoginSchema,
  RefreshTokenResponseSchema,
  RefreshTokenSchema,
} from "@/api/auth/authSchema";
import { validateRequest } from "@/common/models/httpHandlers";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.register("Auth", LoginSchema);

// POST /auth/login
authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  description: "Login to the application for both admin and user",
  request: {
    body: {
      content: {
        "application/json": { schema: LoginSchema.shape.body },
      },
    },
  },
  responses: createApiResponse(LoginResponseSchema, "Success"),
});

authRouter.post("/login", validateRequest(LoginSchema), authController.login);

// POST /auth/refresh-token
authRegistry.registerPath({
  method: "post",
  path: "/auth/refresh-token",
  description: "Refresh the access token",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": { schema: RefreshTokenSchema.shape.body },
      },
    },
  },
  responses: createApiResponse(RefreshTokenResponseSchema, "Success"),
});

authRouter.post("/refresh-token", validateRequest(RefreshTokenSchema), authController.refreshToken);
