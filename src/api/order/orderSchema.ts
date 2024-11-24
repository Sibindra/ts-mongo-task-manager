import { ProductSchema } from "@/api/product/productSchema";
import { UserSchema } from "@/api/user/userSchema";
/**
 * _id
 * product_id
 * user_id  (customer id)
 * order_date // created_at
 * status (pending, completed, cancelled)
 *
 */
import { commonValidations } from "@/common/utils/commonValidation";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export enum EOrderStatus {
  PENDING = "Pending",
  PAID = "Paid",
}

export type TOrder = z.infer<typeof OrderSchema>;
export type TCreateOrder = z.infer<typeof CreateOrderSchema.shape.body>;
export type TUpdateOrderStatus = z.infer<typeof UpdateOrderStatusSchema.shape.body>;
export type TGetOrder = z.infer<typeof GetOrderSchema>;
export type TDeleteOrder = z.infer<typeof DeleteOrderSchema>;

// no order_date since order_date is createdAt but if needed we can add it
export const OrderSchema = z
  .object({
    ...commonValidations,
    products: z.array(ProductSchema),
    customer: UserSchema,
    status: z.nativeEnum(EOrderStatus),
  })
  .strict();

/**
 * order_date - created_at
 * status - pending (default) so no need
 * product_id - from body
 * user_id - from token
 */
export const CreateOrderSchema = z.object({
  body: z.object({
    product_ids: z.array(commonValidations._id),
  }),
});

export const UpdateOrderStatusSchema = z.object({
  params: z.object({ id: commonValidations._id }), // order_id
  body: OrderSchema.pick({
    status: true,
  }).strict(),
});

export const GetOrderSchema = z.object({
  params: z.object({ id: commonValidations._id }), // order_id
});

export const DeleteOrderSchema = z.object({
  params: z.object({ id: commonValidations._id }), // order_id
});
