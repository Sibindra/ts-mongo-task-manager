/**
 * product_id
 * name
 * price
 * stock
 *
 */

import { commonSchema, paginationSchema } from "@/common/utils/commonSchema";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type TProduct = z.infer<typeof ProductSchema>;
export type TGetAllProducts = z.infer<typeof GetAllProductsSchema.shape.query>;
export type TCreateProduct = z.infer<typeof CreateProductSchema.shape.body>;
export type TUpdateProduct = z.infer<typeof UpdateProductSchema.shape.body>;
export type TGetProduct = z.infer<typeof GetProductSchema>;
export type TDeleteProduct = z.infer<typeof DeleteProductSchema>;

export const ProductSchema = z
  .object({
    ...commonSchema,
    name: z.string().min(3).max(255),
    price: z.number().min(0).max(1000000),
    stock: z.number().min(0).max(1000000),
  })
  .strict();

export const GetAllProductsSchema = z.object({
  query: paginationSchema.query,
});

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
  params: z.object({ id: commonSchema._id }),
  body: ProductSchema.omit({
    _id: true,
    updatedAt: true,
    createdAt: true,
  }).partial(),
});

// GET products/:id
export const GetProductSchema = z.object({
  params: z.object({ id: commonSchema._id }),
});

// DELETE products/:id
export const DeleteProductSchema = z.object({
  params: z.object({ id: commonSchema._id }),
});
