import { User } from "@/api/user/userModel";
import type { TCreateUser, TGetAllUsers, TUpdateUser, TUser } from "@/api/user/userSchema";
import { duplicateKeyHandler } from "@/common/models/duplicateKeyHandler";
import { handleServerError } from "@/common/models/handleServerError";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { TPaginationResponse } from "@/common/utils/commonSchema";
import { StatusCodes } from "http-status-codes";

export class UserService {
  // retrieves all users
  async findAll(query: TGetAllUsers): Promise<ServiceResponse<TPaginationResponse<TUser> | null>> {
    try {
      const { page = 1, limit = 10 } = query;
      const skip = page > 0 ? (page - 1) * limit : 0;

      const users = await User.find().skip(skip).limit(limit).lean();

      const totalItems = await User.countDocuments();

      if (!users || users.length === 0) {
        return ServiceResponse.failure("No Users Found", null, StatusCodes.NOT_FOUND);
      }

      const totalPages = Math.ceil(totalItems / limit);

      return ServiceResponse.success<TPaginationResponse<TUser>>("Users Found", {
        data: users,
        totalItems,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      return handleServerError("retrieving all users", error, "An error occurred while retrieving users.");
    }
  }

  // retrieves a single user by ID
  async findById(id: string): Promise<ServiceResponse<TUser | null>> {
    try {
      const user = await User.findById(id).lean();

      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TUser>("User found", user);
    } catch (error) {
      return handleServerError(`finding user with ID ${id}`, error, "An error occurred while finding the user.");
    }
  }

  // create new user
  async createUser(input: TCreateUser): Promise<ServiceResponse<Omit<TUser, "password"> | null>> {
    try {
      const user = await User.create(input);
      const { password, ...userWithoutPassword } = user.toObject();
      return ServiceResponse.success("User Created Successfully", userWithoutPassword);
    } catch (error) {
      const duplicateErrorResponse = duplicateKeyHandler(error, "User already exists");
      if (duplicateErrorResponse) return duplicateErrorResponse;

      return handleServerError("creating user", error, "An error occurred while creating the user.");
    }
  }

  // delete existing user
  async deleteUser(id: string): Promise<ServiceResponse<null>> {
    try {
      const result = await User.deleteOne({ _id: id });

      if (result.deletedCount === 0) {
        return ServiceResponse.failure("No such user found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("User Deleted Successfully", null);
    } catch (error) {
      return handleServerError("deleting user", error, "An error occurred while deleting the user.");
    }
  }

  // update existing user
  async updateUser(id: string, input: TUpdateUser): Promise<ServiceResponse<TUser | null>> {
    try {
      const user = await User.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
      }).lean();

      if (!user) {
        return ServiceResponse.failure("No such user found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("User Updated Successfully", user);
    } catch (error) {
      const duplicateErrorResponse = duplicateKeyHandler(error, "User already exists");
      if (duplicateErrorResponse) return duplicateErrorResponse;

      return handleServerError("updating user", error, "An error occurred while updating the user.");
    }
  }

  async whoami(id: string): Promise<ServiceResponse<TUser | null>> {
    try {
      const user = await User.findById(id).lean();

      if (!user) {
        return ServiceResponse.failure("No such user found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("User found", user);
    } catch (error) {
      return handleServerError("finding user", error, "An error occurred while finding the user.");
    }
  }
}

export const userService = new UserService();
