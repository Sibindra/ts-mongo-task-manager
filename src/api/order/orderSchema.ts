import { ProductSchema } from "@/api/product/productSchema";
import { UserSchema } from "@/api/user/userSchema";
/**
 * _id
 * product_id
 * user_id  (customer id)
 * order_date // created_at
 * status (pending, completed, cancelled)
 */
import { commonSchema, paginationSchema } from "@/common/utils/commonSchema";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export enum EOrderStatus {
  PENDING = "Pending",
  PAID = "Paid",
}

export type TOrder = z.infer<typeof OrderSchema>;
export type TGetAllOrders = z.infer<typeof GetAllOrdersSchema.shape.query>;
export type TCreateOrder = z.infer<typeof CreateOrderSchema.shape.body>;
export type TUpdateOrderStatus = z.infer<typeof UpdateOrderStatusSchema.shape.body>;
export type TGetOrder = z.infer<typeof GetOrderSchema>;
export type TDeleteOrder = z.infer<typeof DeleteOrderSchema>;

// no order_date since order_date is createdAt but if needed we can add it
export const OrderSchema = z
  .object({
    ...commonSchema,
    products: z.array(ProductSchema).min(1),
    customer: UserSchema,
    status: z.nativeEnum(EOrderStatus),
  })
  .strict();

export const CreateOrderSchema = z.object({
  body: z.object({
    productIds: z.array(commonSchema._id),
  }),
});

export const GetAllOrdersSchema = z.object({
  query: z.object({
    ...paginationSchema.query.shape,
    filter: z
      .object({
        status: z.nativeEnum(EOrderStatus).optional(),
        customerId: commonSchema._id.optional(),
        dateRangeStart: z.date().optional(),
        dateRangeEnd: z.date().optional(),
      })
      .optional(),
  }),
});

export const UpdateOrderStatusSchema = z.object({
  params: z.object({ id: commonSchema._id }), // order_id
  body: OrderSchema.pick({
    status: true,
  }).strict(),
});

export const GetOrderSchema = z.object({
  params: z.object({ id: commonSchema._id }), // order_id
});

export const DeleteOrderSchema = z.object({
  params: z.object({ id: commonSchema._id }), // order_id
});
