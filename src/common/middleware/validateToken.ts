import { EUserRoles } from "@/api/user/userSchema";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { tokenUtil } from "@/common/utils/tokenUtil";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";

/**
 *  validate user token and permissions.
 *
 * @param roles - array of user roles allowed to access (optional).
 *                if no roles are provided only checks the token
 * @returns middleware fxn
 */
const validateTokenPermissions = (roles?: EUserRoles[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const header = req.headers.authorization;

    // check for the presence of the auth header
    if (!header) {
      return res.status(StatusCodes.UNAUTHORIZED).json(ServiceResponse.failure("No token provided", null));
    }

    const [scheme, token] = header.split(" ");

    // check token format (must be "Bearer <token>")
    if (scheme !== "Bearer" || !token) {
      return res.status(StatusCodes.UNAUTHORIZED).json(ServiceResponse.failure("Invalid token format", null));
    }

    try {
      const decodedToken = tokenUtil.decodeToken(token);

      if (!decodedToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json(ServiceResponse.failure("Invalid token", null));
      }

      const { role } = decodedToken as JwtPayload;

      // validate role only if roles are provided
      if (roles && roles.length > 0) {
        // ensure the role exists and is valid
        if (!role || !Object.values(EUserRoles).includes(role as EUserRoles)) {
          return res.status(StatusCodes.UNAUTHORIZED).json(ServiceResponse.failure("Invalid role in token", null));
        }

        // block access if the user's role is not in the allowed roles
        if (!roles.includes(role as EUserRoles)) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json(ServiceResponse.failure("Access denied: Insufficient permissions", null));
        }
      }
      // role is valid (or not required)
      next();
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json(ServiceResponse.failure("Failed to authenticate token", null));
    }
  };
};

export { validateTokenPermissions };
