import { exportPaidOrders } from "@/common/cron/jobs/exportPaidOrders";
import { logger } from "@/server";
import { CronJob } from "cron";

export enum ECronSchedule {
  EVERY_MINUTE = "*/1 * * * *", // each minute (for test)
  EVERY_DAY_AT_MIDNIGHT = "0 0 * * *", // each day at midnight
}

// run at midnight
const job = new CronJob(ECronSchedule.EVERY_MINUTE, () => {
  console.log("Running export job at midnight...");
  exportPaidOrders();
});

export const startCronJobs = async () => {
  await job.start();
  logger.info("Starting cron jobs...");
};
