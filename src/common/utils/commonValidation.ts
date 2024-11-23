import { z } from "zod";

export const commonValidations = {
  _id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
};
