import type { TProduct } from "@/api/product/productSchema";
import mongoose, { Schema } from "mongoose";

const mongooseProductSchemaFields = {
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
};

const mongooseProductSchema = new Schema<TProduct>(mongooseProductSchemaFields);

// create an index based on stock and then price
mongooseProductSchema.index({ stock: 1, price: 1 });

export const Product = mongoose.model("products", mongooseProductSchema);
