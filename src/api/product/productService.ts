import { Product } from "@/api/product/productModel";
import type { TCreateProduct, TProduct, TUpdateProduct } from "@/api/product/productSchema";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { duplicateKeyHandler } from "@/common/utils/duplicateKeyHandler";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";

export class ProductService {
  // get all products
  async findAll(): Promise<ServiceResponse<TProduct[] | null>> {
    try {
      const products = await Product.find();

      if (!products || products.length === 0) {
        return ServiceResponse.failure("No Products Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TProduct[]>("Products Found", products);
    } catch (ex) {
      const errorMessage = `Error finding all products: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving products.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // get a single product by its ID
  async findById(id: string): Promise<ServiceResponse<TProduct | null>> {
    try {
      const product = await Product.findById(id);

      if (!product) {
        return ServiceResponse.failure("Product not found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TProduct>("Product found", product);
    } catch (ex) {
      const errorMessage = `Error finding product with id ${id}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while finding product.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // create new product
  async createProduct(input: TCreateProduct): Promise<ServiceResponse<TProduct | null>> {
    try {
      const product = await Product.create(input);

      if (!product) {
        return ServiceResponse.failure("No Product Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TProduct>("Product Created Succesfully", product);
    } catch (ex) {
      const duplicateErrorResponse = duplicateKeyHandler(ex, "Product already exists");
      if (duplicateErrorResponse) {
        return duplicateErrorResponse;
      }

      const errorMessage = `Error creating product: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while creating product.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // delete existing product
  async deleteProduct(id: string): Promise<ServiceResponse<TProduct | null>> {
    try {
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return ServiceResponse.failure("No Product Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TProduct>("Product Deleted Succesfully", product);
    } catch (ex) {
      const errorMessage = `Error deleting product: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while deleting product.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // update existing product
  async updateProduct(id: string, input: TUpdateProduct): Promise<ServiceResponse<TProduct | null>> {
    try {
      const product = await Product.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        return ServiceResponse.failure("No Product Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TProduct>("Product Updated Succesfully", product);
    } catch (ex) {
      const duplicateErrorResponse = duplicateKeyHandler(ex, "Product already exists");

      if (duplicateErrorResponse) {
        return duplicateErrorResponse;
      }
      const errorMessage = `Error updating product: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while updating product.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const productService = new ProductService();
