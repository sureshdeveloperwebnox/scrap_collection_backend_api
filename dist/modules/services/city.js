"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CityService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const cache_1 = require("../../utils/cache");
class CityService {
    async createCity(data) {
        var _a;
        try {
            // Check if city name already exists
            const existingCity = await config_1.prisma.cities.findUnique({
                where: { name: data.name }
            });
            if (existingCity) {
                return api_result_1.ApiResult.error("City with this name already exists", 400);
            }
            const city = await config_1.prisma.cities.create({
                data: {
                    name: data.name,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true
                }
            });
            // Invalidate cities cache
            cache_1.cacheService.deletePattern('^cities:');
            return api_result_1.ApiResult.success(city, "City created successfully", 201);
        }
        catch (error) {
            console.log("Error in createCity", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getCities(query) {
        try {
            const { page = 1, limit = 10, search, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = query;
            // Validate pagination
            const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            if (parsedPage < 1) {
                return api_result_1.ApiResult.error("Page must be greater than 0", 400);
            }
            if (parsedLimit < 1 || parsedLimit > 100) {
                return api_result_1.ApiResult.error("Limit must be between 1 and 100", 400);
            }
            const skip = (parsedPage - 1) * parsedLimit;
            // Generate cache key
            const cacheKey = cache_1.cacheService.generateKey('cities', {
                page: parsedPage,
                limit: parsedLimit,
                search,
                isActive,
                sortBy,
                sortOrder
            });
            // Try to get from cache
            const cachedResult = cache_1.cacheService.get(cacheKey);
            if (cachedResult) {
                return api_result_1.ApiResult.success(cachedResult, "Cities retrieved successfully (cached)");
            }
            const where = {};
            // Coerce isActive to boolean if present
            if (isActive !== undefined && isActive !== null && isActive !== '') {
                let normalizedIsActive;
                if (typeof isActive === 'boolean') {
                    normalizedIsActive = isActive;
                }
                else if (typeof isActive === 'string') {
                    const lowered = isActive.toLowerCase().trim();
                    if (['true', '1', 'yes', 'y'].includes(lowered))
                        normalizedIsActive = true;
                    else if (['false', '0', 'no', 'n'].includes(lowered))
                        normalizedIsActive = false;
                }
                else if (typeof isActive === 'number') {
                    normalizedIsActive = isActive === 1;
                }
                if (typeof normalizedIsActive === 'boolean') {
                    where.isActive = normalizedIsActive;
                }
            }
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } }
                ];
            }
            // Validate sort fields
            const validSortFields = ['name', 'isActive', 'createdAt', 'updatedAt'];
            const validSortOrder = ['asc', 'desc'];
            const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
            const finalSortOrder = validSortOrder.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';
            const orderBy = {};
            orderBy[finalSortBy] = finalSortOrder;
            const [cities, total] = await Promise.all([
                config_1.prisma.cities.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    orderBy
                }),
                config_1.prisma.cities.count({ where })
            ]);
            const totalPages = Math.ceil(total / parsedLimit);
            const hasNextPage = parsedPage < totalPages;
            const hasPreviousPage = parsedPage > 1;
            const result = {
                cities,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages,
                    hasNextPage,
                    hasPreviousPage
                }
            };
            // Cache the result for 3 minutes
            cache_1.cacheService.set(cacheKey, result, 3 * 60 * 1000);
            return api_result_1.ApiResult.success(result, "Cities retrieved successfully");
        }
        catch (error) {
            console.log("Error in getCities", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getCityById(id) {
        try {
            const city = await config_1.prisma.cities.findUnique({
                where: { id }
            });
            if (!city) {
                return api_result_1.ApiResult.error("City not found", 404);
            }
            return api_result_1.ApiResult.success(city, "City retrieved successfully");
        }
        catch (error) {
            console.log("Error in getCityById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateCity(id, data) {
        try {
            const existingCity = await config_1.prisma.cities.findUnique({
                where: { id }
            });
            if (!existingCity) {
                return api_result_1.ApiResult.error("City not found", 404);
            }
            // If name is being updated, check if it already exists
            if (data.name && data.name !== existingCity.name) {
                const duplicateCity = await config_1.prisma.cities.findUnique({
                    where: { name: data.name }
                });
                if (duplicateCity) {
                    return api_result_1.ApiResult.error("City with this name already exists", 400);
                }
            }
            const city = await config_1.prisma.cities.update({
                where: { id },
                data
            });
            // Invalidate cities cache
            cache_1.cacheService.deletePattern('^cities:');
            return api_result_1.ApiResult.success(city, "City updated successfully");
        }
        catch (error) {
            console.log("Error in updateCity", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteCity(id) {
        try {
            const existingCity = await config_1.prisma.cities.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            Employee: true
                        }
                    }
                }
            });
            if (!existingCity) {
                return api_result_1.ApiResult.error("City not found", 404);
            }
            // Check if any employees are assigned to this city
            if (existingCity._count.Employee > 0) {
                return api_result_1.ApiResult.error(`Cannot delete city. There are ${existingCity._count.Employee} employee(s) assigned to this workzone. Please reassign or remove those employees first.`, 400);
            }
            await config_1.prisma.cities.delete({
                where: { id }
            });
            // Invalidate cities cache
            cache_1.cacheService.deletePattern('^cities:');
            return api_result_1.ApiResult.success(null, "City deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteCity", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.CityService = CityService;
