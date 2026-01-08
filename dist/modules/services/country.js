"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
class CountryService {
    async createCountry(data) {
        try {
            // check if country already exists
            const existingCountry = await config_1.prisma.country.findFirst({
                where: {
                    name: data.name
                }
            });
            if (existingCountry) {
                return api_result_1.ApiResult.error("Country name already exists", 400);
            }
            const country = await config_1.prisma.country.create({
                data: {
                    name: data.name,
                    currency: data.currency
                }
            });
            return api_result_1.ApiResult.success(country, "Country created successfully", 201);
        }
        catch (error) {
            console.log("Error in createCountry", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getCountries() {
        try {
            const countries = await config_1.prisma.country.findMany({
                orderBy: {
                    name: 'asc'
                }
            });
            return api_result_1.ApiResult.success(countries, "Countries retrieved successfully");
        }
        catch (error) {
            console.log("Error in getCountries", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.CountryService = CountryService;
