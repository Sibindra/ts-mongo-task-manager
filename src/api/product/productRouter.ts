import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { productController } from "@/api/product/productController";
import {
  CreateProductSchema,
  GetAllProductsSchema,
  GetProductSchema,
  UpdateProductSchema,
} from "@/api/product/productSchema";
import { EUserRoles } from "@/api/user/userSchema";
import upload from "@/common/configs/uploadConfig";
import { validateTokenPermissions } from "@/common/middleware/validateToken";
import { validateRequest } from "@/common/models/httpHandlers";

export const productRegistry = new OpenAPIRegistry();
export const productRouter: Router = express.Router();

productRegistry.register("Product", GetProductSchema);

// GET /products
productRegistry.registerPath({
  method: "get",
  path: "/products",
  tags: ["Product"],
  description: "Get all products. For admin and customer both",
  request: { query: GetAllProductsSchema.shape.query },
  responses: createApiResponse(z.array(GetProductSchema), "Success"),
});

productRouter.get("/", validateRequest(GetAllProductsSchema), productController.getProducts);

// GET /products/:id
productRegistry.registerPath({
  method: "get",
  path: "/products/{id}",
  tags: ["Product"],
  description: "Get a single product by its ID. For both admin and customer",
  request: { params: GetProductSchema.shape.params },
  responses: createApiResponse(GetProductSchema, "Success"),
});

productRouter.get("/:id", validateRequest(GetProductSchema), productController.getProduct);

// POST /products
productRegistry.registerPath({
  method: "post",
  path: "/products",
  tags: ["Product"],
  description: "Create a new product. You need to be an admin for this",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: CreateProductSchema.shape.body },
      },
    },
  },
  responses: createApiResponse(GetProductSchema, "Success"),
});

productRouter.post(
  "/",
  validateTokenPermissions([EUserRoles.ADMIN]),
  validateRequest(CreateProductSchema),
  productController.createProduct,
);

// Update /products/:id
productRegistry.registerPath({
  method: "put",
  path: "/products/{id}",
  tags: ["Product"],
  description: "Update a product by its ID. Need to be an admin for this",
  security: [{ BearerAuth: [] }],
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

productRouter.put(
  "/:id",
  validateTokenPermissions([EUserRoles.ADMIN]),
  validateRequest(UpdateProductSchema),
  productController.updateProduct,
);

// Delete /products/:id
productRegistry.registerPath({
  method: "delete",
  path: "/products/{id}",
  security: [{ BearerAuth: [] }],
  description: "Delete a product by its ID. Need to be an admin for this",
  tags: ["Product"],
  request: { params: GetProductSchema.shape.params },
  responses: createApiResponse(GetProductSchema, "Success"),
});

productRouter.delete(
  "/:id",
  validateTokenPermissions([EUserRoles.ADMIN]),
  validateRequest(GetProductSchema),
  productController.deleteProduct,
);

// file upload for csv files
productRegistry.registerPath({
  method: "post",
  description: "Upload a CSV file to import products. Need to be an admin for this",
  security: [{ BearerAuth: [] }],
  path: "/products/import-csv",
  tags: ["Product"],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({ file: z.instanceof(File) }),
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Success"),
});
productRouter.post(
  "/import-csv",
  validateTokenPermissions([EUserRoles.ADMIN]),
  upload.single("file"),
  productController.importProducts,
);
