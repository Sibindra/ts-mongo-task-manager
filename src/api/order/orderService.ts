import { Order } from "@/api/order/orderModel";
import type { TCreateOrder, TGetAllOrders, TOrder } from "@/api/order/orderSchema";
import { EOrderStatus } from "@/api/order/orderSchema";
import { Product } from "@/api/product/productModel";
import { handleServerError } from "@/common/models/handleServerError";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { TPaginationResponse } from "@/common/utils/commonSchema";
import { StatusCodes } from "http-status-codes";

export class OrderService {
  // get all orders
  async findAll(query: TGetAllOrders): Promise<ServiceResponse<TPaginationResponse<TOrder> | null>> {
    try {
      const { page = 1, limit = 10, filter } = query;
      const skip = page > 0 ? (page - 1) * limit : 0;

      const filters: Record<string, unknown> = {
        ...(filter?.status && { status: filter.status }),
        ...(filter?.customerId && { customer: filter.customerId }),
        ...(filter?.dateRangeStart || filter?.dateRangeEnd
          ? {
              createdAt: {
                ...(filter?.dateRangeStart && { $gte: filter.dateRangeStart }),
                ...(filter?.dateRangeEnd && { $lte: filter.dateRangeEnd }),
              },
            }
          : {}),
      };

      const orders = await Order.find(filters).populate("products").populate("customer").skip(skip).limit(limit).lean();

      const totalItems = await Order.countDocuments();
      const totalPages = Math.ceil(totalItems / limit);

      if (!orders || orders.length === 0) {
        return ServiceResponse.failure("No Orders Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TPaginationResponse<TOrder>>("Orders Found", {
        data: orders,
        totalItems,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      return handleServerError("retrieving all orders", error, "An error occurred while retrieving orders.");
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
      return handleServerError(`finding order with ID ${id}`, error, "An error occurred while finding the order.");
    }
  }

  /**
   * create a new order and decrement the product stock
   */
  async createOrder(user_id: string, input: TCreateOrder): Promise<ServiceResponse<TOrder | null>> {
    try {
      const session = await Order.startSession();
      session.startTransaction();

      try {
        const products = await Product.find({
          _id: { $in: input.productIds },
        })
          .select("stock")
          .session(session);

        if (!products.length || products.length !== input.productIds.length) {
          throw new Error("One or more products not found.");
        }

        // check if all products are in stock
        for (const product of products) {
          if (product.stock < 1) {
            throw new Error(`Product ${product.name} of ${product._id} is out of stock.`);
          }
        }

        const order = await Order.create([{ ...input, products: input.productIds, customer: user_id }], { session });

        if (!order) {
          throw new Error("Order creation failed.");
        }

        // decrement stock
        const updateStock = await Product.updateMany(
          { _id: { $in: input.productIds } },
          { $inc: { stock: -1 } },
          { session },
        );

        if (!updateStock) {
          throw new Error("Failed to update stock.");
        }

        await session.commitTransaction();
        return ServiceResponse.success<TOrder>("Order created successfully", order[0]);
      } catch (ex) {
        await session.abortTransaction();
        throw ex;
      } finally {
        session.endSession();
      }
    } catch (error) {
      return handleServerError("creating order", error, "An error occurred while creating the order.");
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
      return handleServerError(`updating order with ID ${id}`, error, "An error occurred while updating the order.");
    }
  }

  // get all orders by a user
  async getOrdersByUser(user_id: string): Promise<ServiceResponse<TOrder[] | null>> {
    try {
      const orders = await Order.find({ customer: user_id }).lean();

      if (!orders || orders.length === 0) {
        return ServiceResponse.failure("No Orders Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TOrder[]>("Orders Found", orders);
    } catch (error) {
      return handleServerError(
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

        await Product.updateMany({ _id: { $in: order.products } }, { $inc: { stock: 1 } }, { session });

        await session.commitTransaction();
        return ServiceResponse.success<TOrder>("Order Deleted Successfully", order);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      return handleServerError(`deleting order with ID ${id}`, error, "An error occurred while deleting the order.");
    }
  }
}

export const orderService = new OrderService();
