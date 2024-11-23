/**
 * product_id
 * name
 * price
 * stock
 *
 * also need to create index for db here based on name
 */

import { commonValidations } from "@/common/utils/commonValidation";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type TProduct = z.infer<typeof ProductSchema>;
export type TCreateProduct = z.infer<typeof CreateProductSchema.shape.body>;
export type TUpdateProduct = z.infer<typeof UpdateProductSchema.shape.body>;
export type TGetProduct = z.infer<typeof GetProductSchema>;
export type TDeleteProduct = z.infer<typeof DeleteProductSchema>;

export const ProductSchema = z
  .object({
    ...commonValidations,
    name: z.string(),
    price: z.number(),
    stock: z.number(),
  })
  .strict();

//   POST products
export const CreateProductSchema = z.object({
  body: ProductSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
  }),
});

// UPDATE products/:id
export const UpdateProductSchema = z.object({
  params: z.object({ id: commonValidations._id }),
  body: ProductSchema.omit({
    _id: true,
    updatedAt: true,
    createdAt: true,
  }).partial(),
});

// GET products/:id
export const GetProductSchema = z.object({
  params: z.object({ id: commonValidations._id }),
});

// DELETE products/:id
export const DeleteProductSchema = z.object({
  params: z.object({ id: commonValidations._id }),
});
