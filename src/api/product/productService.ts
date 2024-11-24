import fs from "node:fs";
import { Product } from "@/api/product/productModel";
import type { TCreateProduct, TGetAllProducts, TProduct, TUpdateProduct } from "@/api/product/productSchema";
import { duplicateKeyHandler } from "@/common/models/duplicateKeyHandler";
import { handleServerError } from "@/common/models/handleServerError";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { TPaginationResponse } from "@/common/utils/commonSchema";
import csvParser from "csv-parser";
import { StatusCodes } from "http-status-codes";

export class ProductService {
  // get all products
  async findAll(query: TGetAllProducts): Promise<ServiceResponse<TPaginationResponse<TProduct> | null>> {
    try {
      const { page = 1, limit = 10 } = query;
      const skip = page > 0 ? (page - 1) * limit : 0;
      const products = await Product.find().skip(skip).limit(limit).lean();

      const totalItems = await Product.countDocuments();
      const totalPages = Math.ceil(totalItems / limit);

      if (!products || products.length === 0) {
        return ServiceResponse.failure("No Products Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TPaginationResponse<TProduct>>("Products Found", {
        data: products,
        totalItems,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      return handleServerError("retrieving all products", error, "An error occurred while retrieving products.");
    }
  }

  // get a single product by its ID
  async findById(id: string): Promise<ServiceResponse<TProduct | null>> {
    try {
      const product = await Product.findById(id).lean();

      if (!product) {
        return ServiceResponse.failure("Product not found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TProduct>("Product found", product);
    } catch (error) {
      return handleServerError(`finding product with ID ${id}`, error, "An error occurred while finding the product.");
    }
  }

  // create new product
  async createProduct(input: TCreateProduct): Promise<ServiceResponse<TProduct | null>> {
    try {
      const product = await Product.create(input);
      return ServiceResponse.success<TProduct>("Product Created Successfully", product);
    } catch (error) {
      const duplicateErrorResponse = duplicateKeyHandler(error, "Product already exists");
      if (duplicateErrorResponse) return duplicateErrorResponse;

      return handleServerError("creating product", error, "An error occurred while creating the product.");
    }
  }

  // delete existing product
  async deleteProduct(id: string): Promise<ServiceResponse<TProduct | null>> {
    try {
      const product = await Product.findByIdAndDelete(id).lean();

      if (!product) {
        return ServiceResponse.failure("No Product Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TProduct>("Product Deleted Successfully", product);
    } catch (error) {
      return handleServerError("deleting product", error, "An error occurred while deleting the product.");
    }
  }

  // update existing product
  async updateProduct(id: string, input: TUpdateProduct): Promise<ServiceResponse<TProduct | null>> {
    try {
      const product = await Product.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
      }).lean();

      if (!product) {
        return ServiceResponse.failure("No Product Found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TProduct>("Product Updated Successfully", product);
    } catch (error) {
      const duplicateErrorResponse = duplicateKeyHandler(error, "Product already exists");
      if (duplicateErrorResponse) return duplicateErrorResponse;

      return handleServerError("updating product", error, "An error occurred while updating the product.");
    }
  }

  // upload products from CSV file
  async importProductsFromCSV(file: Express.Multer.File): Promise<ServiceResponse<null>> {
    const products: TCreateProduct[] = [];
    try {
      const parseStream = fs.createReadStream(file.path).pipe(csvParser());

      for await (const data of parseStream) {
        if (data.name && data.price && data.stock) {
          products.push({
            name: data.name,
            price: Number(data.price),
            stock: Number(data.stock),
          });
        }
      }

      // if duplicate then ignores and moves on to next product
      await Product.insertMany(products, { ordered: false }); // continue inserting even if some products fail
      return ServiceResponse.success("Products uploaded successfully", null);
    } catch (error) {
      return handleServerError("uploading products from CSV", error, "An error occurred while uploading products.");
    } finally {
      fs.unlinkSync(file.path);
    }
  }
}

export const productService = new ProductService();
