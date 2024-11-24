import { UserSchema } from "@/api/user/userSchema";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type TLogin = z.infer<typeof LoginSchema.shape.body>;
export type TLoginResponse = z.infer<typeof LoginResponseSchema.shape.body>;
export type TRefreshToken = z.infer<typeof RefreshTokenSchema.shape.body>;
export type TRefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema.shape.body>;

export const LoginSchema = z.object({
  body: UserSchema.pick({ email: true, password: true, role: true }).strict(),
});

export const LoginResponseSchema = z.object({
  body: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

export const RefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const RefreshTokenResponseSchema = z.object({
  body: z.object({
    accessToken: z.string(),
  }),
});
