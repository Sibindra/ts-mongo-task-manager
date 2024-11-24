import { Order } from "@/api/order/orderModel";
import type { TCreateOrder, TOrder } from "@/api/order/orderSchema";
import { EOrderStatus } from "@/api/order/orderSchema";
import { Product } from "@/api/product/productModel";
import { ServerErrorResponse } from "@/common/models/serverErrorResponse";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

export class OrderService {
  // get all orders
  async findAll(): Promise<ServiceResponse<TOrder[] | null>> {
    try {
      const orders = await Order.find().lean();

      if (!orders || orders.length === 0) {
        return ServiceResponse.failure("No Orders Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TOrder[]>("Orders Found", orders);
    } catch (error) {
      return ServerErrorResponse.handleError(
        "retrieving all orders",
        error,
        "An error occurred while retrieving orders.",
      );
    }
  }

  // get a single order by its ID
  async findById(id: string): Promise<ServiceResponse<TOrder | null>> {
    try {
      const order = await Order.findById(id).lean();

      if (!order) {
        return ServiceResponse.failure("Order not found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TOrder>("Order found", order);
    } catch (error) {
      return ServerErrorResponse.handleError(
        `finding order with ID ${id}`,
        error,
        "An error occurred while finding the order.",
      );
    }
  }

  /**
   * create a new order and decrement the product stock
   */
  async createOrder(user_id: string, input: TCreateOrder): Promise<ServiceResponse<TOrder | null>> {
    try {
      const session = await Order.startSession();
      session.startTransaction(); // atomic operations

      try {
        const product = await Product.findById(input.product_id).session(session);

        if (!product || product.stock < 1) {
          throw new Error("Product out of stock.");
        }

        const order = await Order.create([{ ...input, user_id }], { session });

        if (!order) {
          throw new Error("Failed to create order.");
        }

        // decrement product stock
        await Product.findByIdAndUpdate(input.product_id, { $inc: { stock: -1 } }, { session });

        await session.commitTransaction();
        return ServiceResponse.success<TOrder>("Order created", order[0]); // Order is an array since `.create()` is called with a session
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      return ServerErrorResponse.handleError("creating order", error, "An error occurred while creating the order.");
    }
  }

  // update existing order status
  async updateOrderStatus(id: string, status: EOrderStatus): Promise<ServiceResponse<TOrder | null>> {
    try {
      const order = await Order.findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true, lean: true });

      if (!order) {
        return ServiceResponse.failure("No Order Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TOrder>(`Order status updated to ${status}`, order);
    } catch (error) {
      return ServerErrorResponse.handleError(
        `updating order with ID ${id}`,
        error,
        "An error occurred while updating the order.",
      );
    }
  }

  // get all orders by a user
  async getOrdersByUser(user_id: string): Promise<ServiceResponse<TOrder[] | null>> {
    try {
      const orders = await Order.find({ user_id }).lean();

      if (!orders || orders.length === 0) {
        return ServiceResponse.failure("No Orders Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TOrder[]>("Orders Found", orders);
    } catch (error) {
      return ServerErrorResponse.handleError(
        `retrieving orders for user with ID ${user_id}`,
        error,
        "An error occurred while retrieving orders.",
      );
    }
  }

  /**
   * @param id order ID
   *
   * delete an order and increment the product stock
   */
  async deleteOrder(id: string): Promise<ServiceResponse<TOrder | null>> {
    try {
      const order = await Order.findById(id).lean();

      if (!order) {
        return ServiceResponse.failure("No Order Found", null, StatusCodes.NOT_FOUND);
      }

      if (order.status !== EOrderStatus.PENDING) {
        return ServiceResponse.failure("Only pending orders can be deleted", null, StatusCodes.FORBIDDEN);
      }

      const session = await Order.startSession();
      session.startTransaction();

      try {
        await Order.findByIdAndDelete(id, { session });
        await Product.findByIdAndUpdate(order.product_id, { $inc: { stock: 1 } }, { session });

        await session.commitTransaction();
        return ServiceResponse.success<TOrder>("Order Deleted Successfully", order);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      return ServerErrorResponse.handleError(
        `deleting order with ID ${id}`,
        error,
        "An error occurred while deleting the order.",
      );
    }
  }
}

export const orderService = new OrderService();
