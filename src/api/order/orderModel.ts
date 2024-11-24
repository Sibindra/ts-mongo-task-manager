import { EOrderStatus, type TOrder } from "@/api/order/orderSchema";
import mongoose, { Schema } from "mongoose";

const mongooseOrderSchemaFields: Record<string, any> = {
  products: {
    type: Array<Schema.Types.ObjectId>,
    ref: "products",
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
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
