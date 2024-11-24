import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";

/**
 * helper fxn to handle internal server errors in services
 * @param action - ction that caused the error (for logger)
 * @param error - error object
 * @param userMessage - error msg for usr
 * @returns failure service response
 */
export function handleServerError(action: string, error: unknown, userMessage: string): ServiceResponse<null> {
  const errorMessage = `Error ${action}: ${(error as Error).message}`;
  logger.error(errorMessage);
  return ServiceResponse.failure(userMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
}
