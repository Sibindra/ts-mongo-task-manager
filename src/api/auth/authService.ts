import type { TLogin, TLoginResponse, TRefreshToken, TRefreshTokenResponse } from "@/api/auth/authSchema";
import { Product } from "@/api/product/productModel";
import { User } from "@/api/user/userModel";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { bcryptUtil } from "@/common/utils/bcryptUtil";
import { type TokenPayload, tokenUtil } from "@/common/utils/tokenUtil";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";

export class AuthService {
  // login
  async login(input: TLogin): Promise<ServiceResponse<TLoginResponse | null>> {
    try {
      const user = await User.findOne({ email: input.email })
        .select("+password")
        .select("-__v")
        .select("-createdAt")
        .select("-updatedAt");

      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }

      // check password
      const isMatch = await bcryptUtil.comparePassword(input.password, user.password);

      if (!isMatch) {
        return ServiceResponse.failure("Invalid email or password", null, StatusCodes.UNAUTHORIZED);
      }

      const payload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = tokenUtil.generateToken(payload);
      const refreshToken = tokenUtil.generateRefreshToken(payload);

      return ServiceResponse.success<TLoginResponse>("Login successful", {
        accessToken,
        refreshToken,
      });
    } catch (ex) {
      const errorMessage = `Error logging in: ${(ex as Error).message}`;
      console.log(ex);
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while logging in.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // refresh token
  async refreshToken(input: TRefreshToken): Promise<ServiceResponse<TRefreshTokenResponse | null>> {
    try {
      const decodedToken = tokenUtil.verifyRefreshToken(input.refreshToken);

      const user = await User.findById((decodedToken as TokenPayload).id)
        .select("-__v")
        .select("-createdAt")
        .select("-updatedAt");

      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }

      const payload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = tokenUtil.generateToken(payload);

      return ServiceResponse.success<TRefreshTokenResponse>("Token refreshed successfully", {
        accessToken,
      });
    } catch (ex) {
      const errorMessage = `Error refreshing token: ${(ex as Error).message}`;
      console.log(ex);
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while refreshing token.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const authService = new AuthService();
