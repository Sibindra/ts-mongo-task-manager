import type { TLogin, TLoginResponse, TRefreshToken, TRefreshTokenResponse } from "@/api/auth/authSchema";
import { User } from "@/api/user/userModel";
import { handleServerError } from "@/common/models/handleServerError";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { bcryptUtil } from "@/common/utils/bcryptUtil";
import { type TokenPayload, tokenUtil } from "@/common/utils/tokenUtil";
import { StatusCodes } from "http-status-codes";

export class AuthService {
  // login user
  async login(input: TLogin): Promise<ServiceResponse<TLoginResponse | null>> {
    try {
      const user = await User.findOne({ email: input.email }).select("+password -__v -createdAt -updatedAt");

      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }

      // check password
      const isMatch = await bcryptUtil.comparePassword(input.password, user.password);
      if (!isMatch) {
        return ServiceResponse.failure("Invalid email or password", null, StatusCodes.UNAUTHORIZED);
      }

      // create tokens
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
    } catch (error) {
      return handleServerError("logging in", error, "An error occurred while logging in.");
    }
  }

  // refresh access token
  async refreshToken(input: TRefreshToken): Promise<ServiceResponse<TRefreshTokenResponse | null>> {
    try {
      const decodedToken = tokenUtil.verifyRefreshToken(input.refreshToken);

      const user = await User.findById((decodedToken as TokenPayload).id).select("-__v -createdAt -updatedAt");

      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }

      // gen new access token
      const payload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const accessToken = tokenUtil.generateToken(payload);

      return ServiceResponse.success<TRefreshTokenResponse>("Token refreshed successfully", {
        accessToken,
      });
    } catch (error) {
      return handleServerError("refreshing token", error, "An error occurred while refreshing token.");
    }
  }
}

export const authService = new AuthService();
