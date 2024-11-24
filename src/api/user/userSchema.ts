import { commonSchema, paginationSchema } from "@/common/utils/commonSchema";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type TUser = z.infer<typeof UserSchema>;
export type TGetAllUsers = z.infer<typeof GetAllUsersSchema.shape.query>;
export type TCreateUser = z.infer<typeof CreateUserSchema>;
export type TUpdateUser = z.infer<typeof UpdateUserSchema.shape.body>;
export type TGetUser = z.infer<typeof GetUserSchema>;
export type TDeleteUser = z.infer<typeof DeleteUserSchema>;

export enum EUserRoles {
  ADMIN = "Admin",
  CUSTOMER = "Customer",
}

export const UserSchema = z
  .object({
    ...commonSchema,
    name: z.string().describe("User name"),
    email: z.string().email().describe("User email address"),
    password: z.string().describe("User password"),

    role: z.nativeEnum(EUserRoles).default(EUserRoles.CUSTOMER),
  })
  .strict();

// POST users
export const CreateUserSchema = z.object({
  body: UserSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
    role: true,
  }),
});

export const GetAllUsersSchema = z.object({
  query: paginationSchema.query,
});

// GET users/:id
export const GetUserSchema = z.object({
  params: z.object({ id: commonSchema._id }),
});

// UPDATE users/:id
export const UpdateUserSchema = z.object({
  params: z.object({ id: commonSchema._id }),
  body: UserSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
    role: true,
    password: true,
  }).partial(),
});

export const UpdateMeSchema = z.object({
  body: UserSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
    role: true,
    password: true,
  }).partial(),
});

// DELETE users/:id
export const DeleteUserSchema = GetUserSchema;
