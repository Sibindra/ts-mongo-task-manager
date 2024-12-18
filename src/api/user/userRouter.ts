import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { userController } from "@/api/user/userController";
import {
  CreateUserSchema,
  EUserRoles,
  GetAllUsersSchema,
  GetUserSchema,
  UpdateMeSchema,
  UpdateUserSchema,
  UserSchema,
} from "@/api/user/userSchema";
import { validateTokenPermissions } from "@/common/middleware/validateToken";
import { validateRequest } from "@/common/models/httpHandlers";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);

// GET /users
userRegistry.registerPath({
  method: "get",
  path: "/users",
  tags: ["User"],
  description: "Get all users. For admin only",
  security: [{ BearerAuth: [] }],
  request: { query: GetAllUsersSchema.shape.query },
  responses: createApiResponse(z.array(UserSchema), "Success"),
});

userRouter.get(
  "/",
  validateTokenPermissions([EUserRoles.ADMIN]),
  validateRequest(GetAllUsersSchema),
  userController.getUsers,
);

// UPDATE me
userRegistry.registerPath({
  method: "put",
  path: "/users/me",
  description: "Update me as a user. This is a self update.",
  tags: ["User"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: UpdateMeSchema.shape.body } },
    },
  },
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.put("/me", validateTokenPermissions(), validateRequest(UpdateMeSchema), userController.updateMe);

// GET /users/me
userRegistry.registerPath({
  method: "get",
  path: "/users/me",
  description: "Get me as a user. This is a self get. For both admin and customer/user",
  tags: ["User"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get("/me", validateTokenPermissions(), userController.whoAmI);

// GET /users/:id
userRegistry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: ["User"],
  description: "Get a single user by its ID. For admin only",
  security: [{ BearerAuth: [] }],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get(
  "/:id",
  validateRequest(GetUserSchema),
  validateTokenPermissions([EUserRoles.ADMIN]),
  userController.getUser,
);

// POST /users
userRegistry.registerPath({
  method: "post",
  path: "/users",
  tags: ["User"],
  description: "Create/Register a new user. For all roles",
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
  description: "Update a user by its ID. Need to be an admin for this",
  security: [{ BearerAuth: [] }],
  request: {
    params: UpdateUserSchema.shape.params,
    body: {
      content: { "application/json": { schema: UpdateUserSchema.shape.body } },
    },
  },
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.put(
  "/:id",
  validateRequest(UpdateUserSchema),
  validateTokenPermissions([EUserRoles.ADMIN]),
  userController.updateUser,
);

// Delete /users/:id
userRegistry.registerPath({
  method: "delete",
  path: "/users/{id}",
  tags: ["User"],
  description: "Delete a user by its ID. For admin only",
  security: [{ BearerAuth: [] }],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.delete(
  "/:id",
  validateTokenPermissions([EUserRoles.ADMIN]),
  validateRequest(GetUserSchema),
  userController.deleteUser,
);
