import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { userController } from "@/api/user/userController";
import { CreateUserSchema, GetUserSchema, UpdateUserSchema, UserSchema } from "@/api/user/userSchema";
import { validateRequest } from "@/common/utils/httpHandlers";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);

// GET /users
userRegistry.registerPath({
  method: "get",
  path: "/users",
  tags: ["User"],
  responses: createApiResponse(z.array(UserSchema), "Success"),
});

userRouter.get("/", userController.getUsers);

// GET /users/:id
userRegistry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: ["User"],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);

// POST /users
userRegistry.registerPath({
  method: "post",
  path: "/users",
  tags: ["User"],
  request: {
    body: {
      content: { "application/json": { schema: CreateUserSchema.shape.body } },
    },
  },
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.post("/", validateRequest(CreateUserSchema), userController.createUser);

// Update /users/:id
userRegistry.registerPath({
  method: "put",
  path: "/users/{id}",
  tags: ["User"],
  request: {
    params: UpdateUserSchema.shape.params,
    body: {
      content: { "application/json": { schema: UpdateUserSchema.shape.body } },
    },
  },
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.put("/:id", validateRequest(UpdateUserSchema), userController.updateUser);

// Delete /users/:id
userRegistry.registerPath({
  method: "delete",
  path: "/users/{id}",
  tags: ["User"],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.delete("/:id", validateRequest(GetUserSchema), userController.deleteUser);
