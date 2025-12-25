import { ICreateCityRequest, IUpdateCityRequest, ICityQueryParams } from "../model/city.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { cacheService } from "../../utils/cache";

export class CityService {
  public async createCity(data: ICreateCityRequest): Promise<ApiResult> {
    try {
      // Check if city name already exists
      const existingCity = await prisma.cities.findUnique({
        where: { name: data.name }
      });

      if (existingCity) {
        return ApiResult.error("City with this name already exists", 400);
      }

      const city = await prisma.cities.create({
        data: {
          name: data.name,
          latitude: data.latitude,
          longitude: data.longitude,
          isActive: data.isActive ?? true
        }
      });

      // Invalidate cities cache
      cacheService.deletePattern('^cities:');

      return ApiResult.success(city, "City created successfully", 201);

    } catch (error: any) {
      console.log("Error in createCity", error);
      return ApiResult.error(error.message);
    }
  }

  public async getCities(query: ICityQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = query as any;

      // Validate pagination
      const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
      
      if (parsedPage < 1) {
        return ApiResult.error("Page must be greater than 0", 400);
      }
      if (parsedLimit < 1 || parsedLimit > 100) {
        return ApiResult.error("Limit must be between 1 and 100", 400);
      }

      const skip = (parsedPage - 1) * parsedLimit;

      // Generate cache key
      const cacheKey = cacheService.generateKey('cities', {
        page: parsedPage,
        limit: parsedLimit,
        search,
        isActive,
        sortBy,
        sortOrder
      });

      // Try to get from cache
      const cachedResult = cacheService.get<any>(cacheKey);
      if (cachedResult) {
        return ApiResult.success(cachedResult, "Cities retrieved successfully (cached)");
      }

      const where: any = {};

      // Coerce isActive to boolean if present
      if (isActive !== undefined && isActive !== null && isActive !== '') {
        let normalizedIsActive: boolean | undefined;
        if (typeof isActive === 'boolean') {
          normalizedIsActive = isActive;
        } else if (typeof isActive === 'string') {
          const lowered = isActive.toLowerCase().trim();
          if (['true', '1', 'yes', 'y'].includes(lowered)) normalizedIsActive = true;
          else if (['false', '0', 'no', 'n'].includes(lowered)) normalizedIsActive = false;
        } else if (typeof isActive === 'number') {
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

      const orderBy: any = {};
      orderBy[finalSortBy] = finalSortOrder;

      const [cities, total] = await Promise.all([
        prisma.cities.findMany({
          where,
          skip,
          take: parsedLimit,
          orderBy
        }),
        prisma.cities.count({ where })
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
      cacheService.set(cacheKey, result, 3 * 60 * 1000);

      return ApiResult.success(result, "Cities retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCities", error);
      return ApiResult.error(error.message);
    }
  }

  public async getCityById(id: number): Promise<ApiResult> {
    try {
      const city = await prisma.cities.findUnique({
        where: { id }
      });

      if (!city) {
        return ApiResult.error("City not found", 404);
      }

      return ApiResult.success(city, "City retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCityById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateCity(id: number, data: IUpdateCityRequest): Promise<ApiResult> {
    try {
      const existingCity = await prisma.cities.findUnique({
        where: { id }
      });

      if (!existingCity) {
        return ApiResult.error("City not found", 404);
      }

      // If name is being updated, check if it already exists
      if (data.name && data.name !== existingCity.name) {
        const duplicateCity = await prisma.cities.findUnique({
          where: { name: data.name }
        });

        if (duplicateCity) {
          return ApiResult.error("City with this name already exists", 400);
        }
      }

      const city = await prisma.cities.update({
        where: { id },
        data
      });

      // Invalidate cities cache
      cacheService.deletePattern('^cities:');

      return ApiResult.success(city, "City updated successfully");

    } catch (error: any) {
      console.log("Error in updateCity", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteCity(id: number): Promise<ApiResult> {
    try {
      const existingCity = await prisma.cities.findUnique({
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
        return ApiResult.error("City not found", 404);
      }

      // Check if any employees are assigned to this city
      if (existingCity._count.Employee > 0) {
        return ApiResult.error(
          `Cannot delete city. There are ${existingCity._count.Employee} employee(s) assigned to this workzone. Please reassign or remove those employees first.`,
          400
        );
      }

      await prisma.cities.delete({
        where: { id }
      });

      // Invalidate cities cache
      cacheService.deletePattern('^cities:');

      return ApiResult.success(null, "City deleted successfully");

    } catch (error: any) {
      console.log("Error in deleteCity", error);
      return ApiResult.error(error.message);
    }
  }
}

