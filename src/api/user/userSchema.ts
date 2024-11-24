import { commonValidations } from "@/common/utils/commonValidation";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type TUser = z.infer<typeof UserSchema>;
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
    ...commonValidations,
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

// GET users/:id
export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations._id }),
});

// UPDATE users/:id
export const UpdateUserSchema = z.object({
  params: z.object({ id: commonValidations._id }),
  body: UserSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
    role: true,
  }),
});

// DELETE users/:id
export const DeleteUserSchema = GetUserSchema;
