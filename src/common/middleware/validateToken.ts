import { EUserRoles } from "@/api/user/userSchema";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { tokenUtil } from "@/common/utils/tokenUtil";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";

/**
 * Middleware to validate user token and permissions.
 *
 * @param roles - array of user roles allowed to access the route
 * @returns express middleware fxn
 */
const validateTokenPermissions = (roles: EUserRoles[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(StatusCodes.UNAUTHORIZED).json(ServiceResponse.failure("No token provided", null));
    }

    const [scheme, token] = header.split(" ");

    // check if the token is in the format "Bearer
    if (scheme !== "Bearer" || !token) {
      return res.status(StatusCodes.UNAUTHORIZED).json(ServiceResponse.failure("Invalid token format", null));
    }

    try {
      const decodedToken = tokenUtil.decodeToken(token);

      if (!decodedToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json(ServiceResponse.failure("Invalid token", null));
      }

      const { role } = decodedToken as JwtPayload;

      if (!role || !Object.values(EUserRoles).includes(role as EUserRoles)) {
        return res.status(StatusCodes.UNAUTHORIZED).json(ServiceResponse.failure("Invalid token", null));
      }

      if (!roles.includes(role as EUserRoles)) {
        return res.status(StatusCodes.FORBIDDEN).json(ServiceResponse.failure("Unauthorized", null));
      }

      // go on to next step
      next();
    } catch (ex) {
      return res.status(StatusCodes.UNAUTHORIZED).json(ServiceResponse.failure("Invalid token", null));
    }
  };
};

export { validateTokenPermissions };
