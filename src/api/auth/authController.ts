import type { Request, RequestHandler, Response } from "express";

import { LoginSchema, RefreshTokenSchema } from "@/api/auth/authSchema";
import { authService } from "@/api/auth/authService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class AuthController {
  public login: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await authService.login(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public refreshToken: RequestHandler = async (req: Request, res: Response) => {
    const { refreshToken } = RefreshTokenSchema.parse(req).body;
    const serviceResponse = await authService.refreshToken({ refreshToken });
    return handleServiceResponse(serviceResponse, res);
  };
}

export const authController = new AuthController();
