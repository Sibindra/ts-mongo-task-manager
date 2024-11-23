import { env } from "@/common/utils/envConfig";
import jwt, { verify } from "jsonwebtoken";

export type TokenPayload = {
  id: string;
  email: string;
  role: string;
};

export const tokenUtil = {
  generateToken: (payload: TokenPayload) => {
    return jwt.sign(payload, env.JWT_SECRET as string, {
      expiresIn: env.JWT_ACCESS_EXPIRATION,
    });
  },

  verifyToken: (token: string) => {
    return jwt.verify(token, env.JWT_SECRET as string);
  },

  decodeToken: (token: string) => {
    return jwt.decode(token);
  },

  generateRefreshToken: (payload: TokenPayload) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET as string, {
      expiresIn: env.JWT_REFRESH_EXPIRATION,
    });
  },

  verifyRefreshToken: (token: string) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET as string);
  },
};
