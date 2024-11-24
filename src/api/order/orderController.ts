import { DeleteOrderSchema, GetOrderSchema, UpdateOrderStatusSchema } from "@/api/order/orderSchema";
import type { Request, RequestHandler, Response } from "express";

import { orderService } from "@/api/order/orderService";
import { handleServiceResponse } from "@/common/models/httpHandlers";
import { getIDFromRequest } from "@/common/utils/getIdFromReq";

class OrderController {
  public getOrders: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await orderService.findAll(req.query);
    return handleServiceResponse(serviceResponse, res);
  };

  public getOrder: RequestHandler = async (req: Request, res: Response) => {
    const { id } = GetOrderSchema.parse(req).params;
    const serviceResponse = await orderService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public createOrder: RequestHandler = async (req: Request, res: Response) => {
    const id = await getIDFromRequest(req);
    const serviceResponse = await orderService.createOrder(id, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteOrder: RequestHandler = async (req: Request, res: Response) => {
    const { id } = DeleteOrderSchema.parse(req).params;
    const serviceResponse = await orderService.deleteOrder(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateOrder: RequestHandler = async (req: Request, res: Response) => {
    const { params, body } = UpdateOrderStatusSchema.parse(req);
    const serviceResponse = await orderService.updateOrderStatus(params.id, body.status);
    return handleServiceResponse(serviceResponse, res);
  };

  public getOrdersByUser: RequestHandler = async (req: Request, res: Response) => {
    const id = await getIDFromRequest(req);
    const serviceResponse = await orderService.getOrdersByUser(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public getMyOrders: RequestHandler = async (req: Request, res: Response) => {
    const id = await getIDFromRequest(req);
    const serviceResponse = await orderService.getOrdersByUser(id);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const orderController = new OrderController();
