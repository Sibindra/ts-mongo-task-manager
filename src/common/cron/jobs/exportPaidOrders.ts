import { Order } from "@/api/order/orderModel";
import { EOrderStatus } from "@/api/order/orderSchema";
import { EEmailAttchments, emailUtil } from "@/common/utils/emailUtil";
import { logger } from "@/server";
import { createObjectCsvStringifier } from "csv-writer";

/**
 * get all paid orders from the db
 * export them into a CSV content
 * send it as an email attachment.
 */
const exportPaidOrders = async () => {
  try {
    const paidOrders = await Order.find({ status: EOrderStatus.PAID }).populate("products").populate("customer").exec();

    if (paidOrders.length === 0) {
      console.log("No paid orders found!");
      return;
    }

    const csvStringifier = createObjectCsvStringifier({
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

    const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

    console.log("CSV content generated for email:", csvContent);

    // send admin email at midnight
    await emailUtil.sendAdminEmailNotification(`Log of paid orders for ${new Date().toISOString().split("T")[0]}`, [
      {
        filename: `record-${new Date().toISOString().split("T")[0]}.csv`,
        content: csvContent,
        contentType: EEmailAttchments.CSV,
      },
    ]);

    logger.info("Paid orders CSV content sent successfully");
    console.log("Paid orders CSV content sent successfully");
  } catch (error) {
    console.error("Error exporting paid orders:", error);
    logger.error("Error exporting paid orders:", error);
  }
};

export { exportPaidOrders };
