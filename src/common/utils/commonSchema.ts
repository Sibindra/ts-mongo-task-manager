import { z } from "zod";

export type TPaginationResponse<T> = {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
};

export const commonSchema = {
  _id: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: "Invalid ObjectId format",
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
};

export const paginationSchema = {
  query: z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
  }),
};
