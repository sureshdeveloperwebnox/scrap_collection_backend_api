import { ICreateVehicleTypeRequest, IUpdateVehicleTypeRequest, IVehicleTypeQueryParams } from "../model/vehicle-type.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { cacheService } from "../../utils/cache";

export class VehicleTypeService {
  public async createVehicleType(data: ICreateVehicleTypeRequest): Promise<ApiResult> {
    try {
      // Check if organization exists (if provided)
      if (data.organizationId) {
        const organization = await prisma.organization.findUnique({
          where: { id: data.organizationId }
        });

        if (!organization) {
          return ApiResult.error("Organization not found", 404);
        }
      }

      // Check if vehicle type name already exists for this organization
      const existingVehicleType = await prisma.vehicleType.findFirst({
        where: {
          name: data.name,
          organizationId: data.organizationId || null
        }
      });

      if (existingVehicleType) {
        return ApiResult.error("Vehicle type with this name already exists for this organization", 400);
      }

      const vehicleType = await prisma.vehicleType.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,

          isActive: data.isActive ?? true
        },
        include: {
          organization: {
            select: {
              name: true
            }
          }
        }
      });

      // Invalidate vehicle types cache and stats cache
      cacheService.deletePattern('^vehicle-types:');
      cacheService.deletePattern('^vehicle-type-stats:');

      return ApiResult.success(vehicleType, "Vehicle type created successfully", 201);

    } catch (error: any) {
      console.log("Error in createVehicleType", error);
      return ApiResult.error(error.message);
    }
  }

  public async getVehicleTypes(query: IVehicleTypeQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, isActive, organizationId, sortBy = 'createdAt', sortOrder = 'desc' } = query as any;

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
      const cacheKey = cacheService.generateKey('vehicle-types', {
        page: parsedPage,
        limit: parsedLimit,
        search,
        isActive,
        organizationId,
        sortBy,
        sortOrder
      });

      // Try to get from cache
      const cachedResult = cacheService.get<any>(cacheKey);
      if (cachedResult) {
        return ApiResult.success(cachedResult, "Vehicle types retrieved successfully (cached)");
      }

      const where: any = {};

      // Coerce organizationId to number if present
      if (organizationId !== undefined && organizationId !== null && organizationId !== '') {
        const parsedOrgId = typeof organizationId === 'string' ? parseInt(organizationId as any, 10) : Number(organizationId);
        if (!Number.isNaN(parsedOrgId)) {
          where.organizationId = parsedOrgId;
        }
      }

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

      const [vehicleTypes, total] = await Promise.all([
        prisma.vehicleType.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            organization: {
              select: {
                name: true
              }
            }
          },
          orderBy
        }),
        prisma.vehicleType.count({ where })
      ]);

      const totalPages = Math.ceil(total / parsedLimit);
      const hasNextPage = parsedPage < totalPages;
      const hasPreviousPage = parsedPage > 1;

      const result = {
        vehicleTypes,
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

      return ApiResult.success(result, "Vehicle types retrieved successfully");

    } catch (error: any) {
      console.log("Error in getVehicleTypes", error);
      return ApiResult.error(error.message);
    }
  }

  public async getVehicleTypeById(id: number): Promise<ApiResult> {
    try {
      const vehicleType = await prisma.vehicleType.findUnique({
        where: { id },
        include: {
          organization: {
            select: {
              name: true
            }
          }
        }
      });

      if (!vehicleType) {
        return ApiResult.error("Vehicle type not found", 404);
      }

      return ApiResult.success(vehicleType, "Vehicle type retrieved successfully");

    } catch (error: any) {
      console.log("Error in getVehicleTypeById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateVehicleType(id: number, data: IUpdateVehicleTypeRequest): Promise<ApiResult> {
    try {
      const existingVehicleType = await prisma.vehicleType.findUnique({
        where: { id }
      });

      if (!existingVehicleType) {
        return ApiResult.error("Vehicle type not found", 404);
      }

      // If name is being updated, check if it already exists for this organization
      if (data.name && data.name !== existingVehicleType.name) {
        const duplicateVehicleType = await prisma.vehicleType.findFirst({
          where: {
            name: data.name,
            organizationId: existingVehicleType.organizationId,
            id: { not: id }
          }
        });

        if (duplicateVehicleType) {
          return ApiResult.error("Vehicle type with this name already exists for this organization", 400);
        }
      }

      const vehicleType = await prisma.vehicleType.update({
        where: { id },
        data,
        include: {
          organization: {
            select: {
              name: true
            }
          }
        }
      });

      // Invalidate vehicle types cache and stats cache
      cacheService.deletePattern('^vehicle-types:');
      cacheService.deletePattern('^vehicle-type-stats:');

      return ApiResult.success(vehicleType, "Vehicle type updated successfully");

    } catch (error: any) {
      console.log("Error in updateVehicleType", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteVehicleType(id: number): Promise<ApiResult> {
    try {
      const existingVehicleType = await prisma.vehicleType.findUnique({
        where: { id }
      });

      if (!existingVehicleType) {
        return ApiResult.error("Vehicle type not found", 404);
      }

      // Note: Since the schema changed:
      // - Leads now use vehicleType enum (VehicleTypeEnum) which is independent of VehicleType table
      // - Orders use vehicleDetails JSON which doesn't reference VehicleType table
      // So we can't check if a VehicleType is being used in leads or orders
      // VehicleType is now more of a master/reference table for UI purposes

      await prisma.vehicleType.delete({
        where: { id }
      });

      // Invalidate vehicle types cache and stats cache
      cacheService.deletePattern('^vehicle-types:');
      cacheService.deletePattern('^vehicle-type-stats:');

      return ApiResult.success(null, "Vehicle type deleted successfully");

    } catch (error: any) {
      console.log("Error in deleteVehicleType", error);
      return ApiResult.error(error.message);
    }
  }

  public async getVehicleTypeStats(organizationId: number): Promise<ApiResult> {
    try {
      // Build cache key for stats
      const cacheKey = cacheService.generateKey('vehicle-type-stats', { organizationId });

      // Try to get from cache
      const cachedResult = cacheService.get<any>(cacheKey);
      if (cachedResult) {
        return ApiResult.success(cachedResult, "Vehicle type statistics retrieved successfully (cached)");
      }

      const stats = await prisma.vehicleType.groupBy({
        by: ['isActive'],
        where: { organizationId },
        _count: {
          isActive: true
        }
      });

      const totalVehicleTypes = await prisma.vehicleType.count({
        where: { organizationId }
      });

      const statsMap = {
        total: totalVehicleTypes,
        active: 0,
        inactive: 0
      };

      stats.forEach(stat => {
        if (stat.isActive) {
          statsMap.active = stat._count.isActive;
        } else {
          statsMap.inactive = stat._count.isActive;
        }
      });

      // Cache the result for 2 minutes
      cacheService.set(cacheKey, statsMap, 2 * 60 * 1000);

      return ApiResult.success(statsMap, "Vehicle type statistics retrieved successfully");

    } catch (error: any) {
      console.log("Error in getVehicleTypeStats", error);
      return ApiResult.error(error.message);
    }
  }
} 