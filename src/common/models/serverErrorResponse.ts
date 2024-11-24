import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";

// helper class to handle internal server errors in services
export class ServerErrorResponse {
  handleError(action: string, error: unknown, userMessage: string): ServiceResponse<null> {
    const errorMessage = `Error ${action}: ${(error as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(userMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
