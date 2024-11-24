import { ServiceResponse } from "@/common/models/serviceResponse";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";

const unexpectedRequest: RequestHandler = (_req, res) => {
  res.sendStatus(StatusCodes.NOT_FOUND);
};

const addErrorToRequestLog: ErrorRequestHandler = (err, _req, res, next) => {
  res.locals.err = err;
  next(err);
};

const fileUploadErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(ServiceResponse.failure("Invalid File Type (Only CSV files are allowed)", null, StatusCodes.BAD_REQUEST));
  }
};

export default () => [unexpectedRequest, addErrorToRequestLog, fileUploadErrorHandler];
