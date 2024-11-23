import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { productController } from "@/api/product/productController";
import { CreateProductSchema, GetProductSchema, UpdateProductSchema } from "@/api/product/productSchema";
import { validateRequest } from "@/common/utils/httpHandlers";
import upload from "@/common/utils/upload";

export const productRegistry = new OpenAPIRegistry();
export const productRouter: Router = express.Router();

productRegistry.register("Product", GetProductSchema);

// GET /products
productRegistry.registerPath({
  method: "get",
  path: "/products",
  tags: ["Product"],
  responses: createApiResponse(z.array(GetProductSchema), "Success"),
});

productRouter.get("/", productController.getProducts);

// GET /products/:id
productRegistry.registerPath({
  method: "get",
  path: "/products/{id}",
  tags: ["Product"],
  request: { params: GetProductSchema.shape.params },
  responses: createApiResponse(GetProductSchema, "Success"),
});

productRouter.get("/:id", validateRequest(GetProductSchema), productController.getProduct);

// POST /products
productRegistry.registerPath({
  method: "post",
  path: "/products",
  tags: ["Product"],
  request: {
    body: {
      content: {
        "application/json": { schema: CreateProductSchema.shape.body },
      },
    },
  },
  responses: createApiResponse(GetProductSchema, "Success"),
});

productRouter.post("/", validateRequest(CreateProductSchema), productController.createProduct);

// Update /products/:id
productRegistry.registerPath({
  method: "put",
  path: "/products/{id}",
  tags: ["Product"],
  request: {
    params: UpdateProductSchema.shape.params,
    body: {
      content: {
        "application/json": { schema: UpdateProductSchema.shape.body },
      },
    },
  },
  responses: createApiResponse(GetProductSchema, "Success"),
});

productRouter.put("/:id", validateRequest(UpdateProductSchema), productController.updateProduct);

// Delete /products/:id
productRegistry.registerPath({
  method: "delete",
  path: "/products/{id}",
  tags: ["Product"],
  request: { params: GetProductSchema.shape.params },
  responses: createApiResponse(GetProductSchema, "Success"),
});

productRouter.delete("/:id", validateRequest(GetProductSchema), productController.deleteProduct);

// file upload for csv files
productRouter.post("/upload", upload.single("file"), productController.importProducts);
