import { Product } from "@/api/product/productModel";
import { logger } from "@/server";
import { EEmailTemplate, emailUtil } from "../utils/emailUtil";

const threshold = 10;

async function watchProductStock() {
  try {
    const changeStream = await Product.watch([
      {
        $match: {
          operationType: "update",
          "updateDescription.updatedFields.stock": { $exists: true },
        },
      },
    ]);

    logger.info("Watching product stock changes");

    changeStream.on("change", async (change) => {
      logger.info("Change detected:", change);

      const updatedFields = change.updateDescription.updatedFields || {};
      const stock = updatedFields.stock;

      if (stock !== undefined) {
        logger.info(`Product stock updated: ${change.documentKey._id}, Stock: ${stock}`);

        if (stock <= threshold) {
          logger.info(`Stock is below threshold for Product ID: ${change.documentKey._id}`);

          await Product.findById(change.documentKey._id).then((product) => {
            if (product) {
              emailUtil.sendAdminEmailNotification(
                EEmailTemplate.ADMIN_NOTIFICATION,
                `Product ${product.name}'s stock is below threshold ${threshold}.`,
              );
            }
          });
        }
      }
    });
  } catch (error) {
    logger.error("Error watching product stock changes", error);
  }
}

export { watchProductStock };
