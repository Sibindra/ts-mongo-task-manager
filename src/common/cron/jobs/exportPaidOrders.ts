import fs from "node:fs";
import path from "node:path";
import { Order } from "@/api/order/orderModel";
import { EOrderStatus } from "@/api/order/orderSchema";
import { env } from "@/common/configs/envConfig";
import { logger } from "@/server";
import { createObjectCsvWriter } from "csv-writer";

/**
 * get all paid orders from the db
 * export them into a CSV
 * and save it to the specified folder.
 */
const exportPaidOrders = async () => {
  try {
    const paidOrders = await Order.find({ status: EOrderStatus.PAID }).populate("products").populate("customer").exec();

    if (paidOrders.length === 0) {
      console.log("No paid orders found!");
      return;
    }

    const filePath = path.join(env.CSV_RECORDS_PATH, `record-${new Date().toISOString().split("T")[0]}.csv`);

    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true }); // create folder if it does not exist
    }

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "order_id", title: "Order ID" },
        { id: "customer_name", title: "Customer Name" },
        { id: "total_price", title: "Total Price" },
        { id: "order_date", title: "Order Date" },
        { id: "status", title: "Status" },
      ],
    });

    const records = paidOrders.map((order) => {
      const totalPrice = order.products.reduce((sum: number, product: any) => sum + product.price, 0);

      return {
        order_id: order._id.toString(),
        customer_name: order.customer.name,
        total_price: totalPrice.toFixed(2),
        order_date: order.createdAt.toISOString().split("T")[0],
        status: order.status,
      };
    });

    // Write records to the CSV
    await csvWriter.writeRecords(records);
    logger.info(`Paid orders exported to ${filePath}`);
    console.log(`Paid orders exported to ${filePath}`);
  } catch (error) {
    console.error("Error exporting paid orders:", error);
    logger.error("Error exporting paid orders:", error);
  }
};

export { exportPaidOrders };
