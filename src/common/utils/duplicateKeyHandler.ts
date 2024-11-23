import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";

export function duplicateKeyHandler(ex: any, message: string): ServiceResponse | null {
  if (ex.code === 11000) {
    return ServiceResponse.failure(message, null, StatusCodes.CONFLICT);
  }
  return null;
}
