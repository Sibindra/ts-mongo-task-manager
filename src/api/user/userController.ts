import type { Request, RequestHandler, Response } from "express";

import { DeleteUserSchema, GetUserSchema, UpdateUserSchema } from "@/api/user/userSchema";
import { userService } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/models/httpHandlers";
import { getIDFromRequest } from "@/common/utils/getIdFromReq";

class UserController {
  public whoAmI: RequestHandler = async (req: Request, res: Response) => {
    const id = await getIDFromRequest(req);
    const serviceResponse = await userService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public getUsers: RequestHandler = async (req: Request, res: Response) => {
    const query = req.query;
    const serviceResponse = await userService.findAll(query);
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

  public updateMe: RequestHandler = async (req: Request, res: Response) => {
    const id = (await getIDFromRequest(req)) as string;
    const serviceResponse = await userService.updateUser(id, req.body);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const userController = new UserController();
