import { User } from "@/api/user/userModel";
import { EUserRoles } from "@/api/user/userSchema";
import { env } from "@/common/configs/envConfig";
import connectMongoDB from "@/common/database/connectMongoDB"; // Ensure this is the correct path
import { bcryptUtil } from "@/common/utils/bcryptUtil";
import mongoose from "mongoose";

export const adminSeed = async () => {
  try {
    // check if the admin user already exists
    const admin = await User.findOne({ role: EUserRoles.ADMIN });
    if (!admin) {
      await User.create({
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: EUserRoles.ADMIN,
      });

      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    // close the database con
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

(async () => {
  await connectMongoDB();
  await adminSeed();
})();
