import { User } from "@/api/user/userModel";
import type { TCreateUser, TUpdateUser, TUser } from "@/api/user/userSchema";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { duplicateKeyHandler } from "@/common/utils/duplicateKeyHandler";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";

export class UserService {
  // retrieves all users from the database
  async findAll(): Promise<ServiceResponse<TUser[] | null>> {
    try {
      const users = await User.find();

      if (!users || users.length === 0) {
        return ServiceResponse.failure("No Users Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TUser[]>("Users Found", users);
    } catch (ex) {
      const errorMessage = `Error finding all users: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving users.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // retrieves a single user by their ID
  async findById(id: string): Promise<ServiceResponse<TUser | null>> {
    try {
      const user = await User.findById(id);

      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TUser>("User found", user);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // create new user
  async createUser(input: TCreateUser): Promise<ServiceResponse<Omit<TUser, "password"> | null>> {
    try {
      const user = await User.create(input);

      if (!user) {
        return ServiceResponse.failure("No User Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<Omit<TUser, "password">>("User Created Succesfully", user);
    } catch (ex) {
      const duplicateErrorResponse = duplicateKeyHandler(ex, "User already exists");
      if (duplicateErrorResponse) {
        return duplicateErrorResponse;
      }

      const errorMessage = `Error creating user $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while creating user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // delete existing user
  async deleteUser(id: string): Promise<ServiceResponse<null>> {
    try {
      const { acknowledged } = await User.deleteOne({
        _id: id,
      });

      if (!acknowledged) {
        return ServiceResponse.failure("No such user found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("User Deleted Succesfully", null);
    } catch (ex) {
      const errorMessage = `Error deleting user $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while deleting user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // update/edit existing user
  async updateUser(id: string, input: TUpdateUser): Promise<ServiceResponse<TUser | null>> {
    try {
      const user = await User.updateOne(
        {
          _id: id,
        },
        input,
      );

      if (!user) {
        return ServiceResponse.failure("No such user found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("User Updated Succesfully", null);
    } catch (ex) {
      const errorMessage = `Error updating user $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while updating user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const userService = new UserService();
