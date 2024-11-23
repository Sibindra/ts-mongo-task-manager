import type { Request, RequestHandler, Response } from "express";

import { DeleteUserSchema, GetUserSchema, UpdateUserSchema } from "@/api/user/userSchema";
import { userService } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class UserController {
  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const { id } = GetUserSchema.parse(req).params;
    const serviceResponse = await userService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public createUser: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.createUser(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteUser: RequestHandler = async (req: Request, res: Response) => {
    const { id } = DeleteUserSchema.parse(req).params;
    const serviceResponse = await userService.deleteUser(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateUser: RequestHandler = async (req: Request, res: Response) => {
    const { params, body } = UpdateUserSchema.parse(req);
    const serviceResponse = await userService.updateUser(params.id, body);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const userController = new UserController();
