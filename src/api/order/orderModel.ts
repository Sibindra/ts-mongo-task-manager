import { EOrderStatus, type TOrder } from "@/api/order/orderSchema";
import mongoose, { Schema } from "mongoose";

const mongooseOrderSchemaFields = {
  product_id: { type: String, required: true },
  user_id: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(EOrderStatus),
    default: EOrderStatus.PENDING,
  },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
};

const mongooseOrderSchema = new Schema<TOrder>(mongooseOrderSchemaFields);

export const Order = mongoose.model<TOrder>("orders", mongooseOrderSchema);
