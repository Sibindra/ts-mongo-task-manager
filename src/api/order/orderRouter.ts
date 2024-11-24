import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { orderController } from "@/api/order/orderController";
import { CreateOrderSchema, GetOrderSchema, UpdateOrderStatusSchema } from "@/api/order/orderSchema";
import { EUserRoles } from "@/api/user/userSchema";
import { validateTokenPermissions } from "@/common/middleware/validateToken";
import { validateRequest } from "@/common/utils/httpHandlers";

export const orderRegistry = new OpenAPIRegistry();
export const orderRouter: Router = express.Router();

orderRegistry.register("Order", GetOrderSchema);

// GET /orders
orderRegistry.registerPath({
  method: "get",
  path: "/orders",
  security: [{ BearerAuth: [] }],
  description: "Get all orders",
  tags: ["Order"],
  responses: createApiResponse(z.array(GetOrderSchema), "Success"),
});

orderRouter.get("/", orderController.getOrders);

// GET /orders/:id
orderRegistry.registerPath({
  method: "get",
  path: "/orders/{id}",
  tags: ["Order"],
  description: "Get a single order by its ID",
  security: [{ BearerAuth: [] }],
  request: { params: GetOrderSchema.shape.params },
  responses: createApiResponse(GetOrderSchema, "Success"),
});

orderRouter.get("/:id", validateRequest(GetOrderSchema), orderController.getOrder);

// POST /orders
orderRegistry.registerPath({
  method: "post",
  path: "/orders",
  description: "Create a new order",
  tags: ["Order"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: CreateOrderSchema.shape.body },
      },
    },
  },
  responses: createApiResponse(GetOrderSchema, "Success"),
});

orderRouter.post(
  "/",
  validateTokenPermissions([EUserRoles.ADMIN, EUserRoles.CUSTOMER]),
  validateRequest(CreateOrderSchema),
  orderController.createOrder,
);

// Update /orders/:id
orderRegistry.registerPath({
  method: "put",
  path: "/orders/{id}",
  description: "Update the status of an order",
  tags: ["Order"],
  security: [{ BearerAuth: [] }],
  request: {
    params: UpdateOrderStatusSchema.shape.params,
    body: {
      content: {
        "application/json": { schema: UpdateOrderStatusSchema.shape.body },
      },
    },
  },
  responses: createApiResponse(GetOrderSchema, "Success"),
});

orderRouter.put(
  "/:id",
  validateTokenPermissions([EUserRoles.ADMIN]),
  validateRequest(UpdateOrderStatusSchema),
  orderController.updateOrder,
);

// DELETE /orders/:id
orderRegistry.registerPath({
  method: "delete",
  path: "/orders/{id}",
  description: "Delete an order",
  tags: ["Order"],
  security: [{ BearerAuth: [] }],
  request: { params: GetOrderSchema.shape.params },
  responses: createApiResponse(GetOrderSchema, "Success"),
});

orderRouter.delete(
  "/:id",
  validateTokenPermissions([EUserRoles.ADMIN, EUserRoles.CUSTOMER]),
  validateRequest(GetOrderSchema),
  orderController.deleteOrder,
);

// GET /orders/user
orderRegistry.registerPath({
  method: "get",
  path: "/orders/user",
  description: "Get all orders by a user",
  tags: ["Order"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.array(GetOrderSchema), "Success"),
});

orderRouter.get("/user", validateTokenPermissions([EUserRoles.ADMIN]), orderController.getOrdersByUser);

// GET /orders/my-orders
orderRegistry.registerPath({
  method: "get",
  path: "/orders/my-orders",
  description: "Get all orders by the current user",
  tags: ["Order"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.array(GetOrderSchema), "Success"),
});

orderRouter.get("/my-orders", validateTokenPermissions([EUserRoles.CUSTOMER]), orderController.getMyOrders);
