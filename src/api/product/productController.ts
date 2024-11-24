import type { Request, RequestHandler, Response } from "express";

import { DeleteProductSchema, GetProductSchema, UpdateProductSchema } from "@/api/product/productSchema";

import { productService } from "@/api/product/productService";
import { handleServiceResponse } from "@/common/models/httpHandlers";

class ProductController {
  public getProducts: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await productService.findAll(req.query);
    return handleServiceResponse(serviceResponse, res);
  };

  public getProduct: RequestHandler = async (req: Request, res: Response) => {
    const { id } = GetProductSchema.parse(req).params;
    const serviceResponse = await productService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public createProduct: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await productService.createProduct(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteProduct: RequestHandler = async (req: Request, res: Response) => {
    const { id } = DeleteProductSchema.parse(req).params;
    const serviceResponse = await productService.deleteProduct(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateProduct: RequestHandler = async (req: Request, res: Response) => {
    const { params, body } = UpdateProductSchema.parse(req);
    const serviceResponse = await productService.updateProduct(params.id, body);
    return handleServiceResponse(serviceResponse, res);
  };

  public importProducts: RequestHandler = async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;
    const serviceResponse = await productService.importProductsFromCSV(file);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const productController = new ProductController();
