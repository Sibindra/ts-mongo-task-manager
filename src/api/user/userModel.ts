import { EUserRoles, type TUser } from "@/api/user/userSchema";
import { bcryptUtil } from "@/common/utils/bcryptUtil";
import { logger } from "@/server";
import mongoose, { Schema } from "mongoose";

const mongooseUserSchemaFields = {
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: Object.values(EUserRoles),
    default: EUserRoles.CUSTOMER,
  },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
};

const mongooseUserSchema = new Schema<TUser>(mongooseUserSchemaFields);

// creating index for user email
mongooseUserSchema.index({ email: 1 }, { unique: true });

// hash password before saving to collxn
mongooseUserSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      // hash only if password is modified
      this.password = await bcryptUtil.hashPassword(this.password);
    }
    next();
  } catch (error) {
    logger.error("Error hashing password during save operation:", error);
    next(error as mongoose.CallbackError);
  }
});

export const User = mongoose.model<TUser>("users", mongooseUserSchema);
