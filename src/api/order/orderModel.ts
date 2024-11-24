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

// index for common filters
mongooseOrderSchema.index({ customer: 1, status: 1, createdAt: 1 });

// index for pagination sort by latest
mongooseOrderSchema.index({ createdAt: -1 });

// index for customer-id
mongooseOrderSchema.index({ customer: 1 });

// Single index for order status
mongooseOrderSchema.index({ status: 1 });

export const Order = mongoose.model<TOrder>("orders", mongooseOrderSchema);
