import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, type ZodSchema } from "zod";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { normalizeQuery } from "@/common/utils/normalizeQuery";

export const handleServiceResponse = (serviceResponse: ServiceResponse<any>, response: Response) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

export const validateRequest = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: normalizeQuery(req.query),
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errorMessages: string[] = err.errors.map((e) => {
        return `Path: ${e.path.join(".")}, Message: ${e.message}`;
      });

      const statusCode = StatusCodes.BAD_REQUEST;
      const serviceResponse = ServiceResponse.failure("Validation errors occurred", errorMessages, statusCode);
      return handleServiceResponse(serviceResponse, res);
    }

    const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    const serviceResponse = ServiceResponse.failure("An unexpected error occurred", null, statusCode);
    return handleServiceResponse(serviceResponse, res);
  }
};
