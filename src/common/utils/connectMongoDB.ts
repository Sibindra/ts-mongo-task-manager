import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";
import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URL);
    logger.info("Mongodb Connected!");
  } catch (error) {
    logger.error("Mongodb Connection Failed!", error);
  }
};

export default connectMongoDB;
