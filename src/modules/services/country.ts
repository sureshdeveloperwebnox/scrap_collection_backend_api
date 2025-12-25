import { ICreateCountryRequest } from "../model/country.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";

export class CountryService {
  public async createCountry(data: ICreateCountryRequest): Promise<ApiResult> {
    try {
      // check if country already exists
      const existingCountry = await prisma.country.findFirst({
        where: {
          name: data.name
        }
      });

      if (existingCountry) {
        return ApiResult.error("Country name already exists", 400);
      }

      const country = await prisma.country.create({
        data: {
          name: data.name,
          currency: data.currency
        }
      });

      return ApiResult.success(country, "Country created successfully", 201);

    } catch (error: any) {
      console.log("Error in createCountry", error);
      return ApiResult.error(error.message);
    }
  }

  public async getCountries(): Promise<ApiResult> {
    try {
      const countries = await prisma.country.findMany({
        orderBy: {
          name: 'asc'
        }
      });

      return ApiResult.success(countries, "Countries retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCountries", error);
      return ApiResult.error(error.message);
    }
  }
}