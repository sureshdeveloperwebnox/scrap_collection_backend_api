import { ICreateVehicleNameRequest, IUpdateVehicleNameRequest, IVehicleNameQueryParams } from "../model/vehicle-name.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { cacheService } from "../../utils/cache";

export class VehicleNameService {
  public async createVehicleName(data: ICreateVehicleNameRequest): Promise<ApiResult> {
    try {
      // Check if organization exists
      const organization = await prisma.organization.findUnique({
        where: { id: data.organizationId }
      });

      if (!organization) {
        return ApiResult.error("Organization not found", 404);
      }

      // Check if vehicle type exists
      const vehicleType = await prisma.vehicleType.findUnique({
        where: { id: data.vehicleTypeId }
      });

      if (!vehicleType) {
        return ApiResult.error("Vehicle type not found", 404);
      }

      // Auto-generate name from make and model if name is not provided
      let vehicleName = data.name;
      if (!vehicleName || vehicleName.trim() === '') {
        if (data.make && data.model) {
          vehicleName = `${data.make} ${data.model}`.trim();
        } else if (data.make) {
          vehicleName = data.make;
        } else if (data.model) {
          vehicleName = data.model;
        } else {
          return ApiResult.error("Vehicle name is required. Please provide make and/or model.", 400);
        }
      }

      // Check if vehicle name already exists for this combination
      const existingVehicleName = await prisma.vehicleName.findFirst({
        where: {
          name: vehicleName,
          vehicleTypeId: data.vehicleTypeId,
          organizationId: data.organizationId
        }
      });

      if (existingVehicleName) {
        return ApiResult.error("Vehicle name with this combination already exists", 400);
      }

      const createdVehicleName = await prisma.vehicleName.create({
        data: {
          organizationId: data.organizationId,
          name: vehicleName,
          vehicleTypeId: data.vehicleTypeId,
          make: data.make || null,
          model: data.model || null,
          year: data.year || null,
          vehicleId: data.vehicleId, // Required field
          isActive: data.isActive ?? true
        },
        include: {
          vehicleType: {
            select: {
              id: true,
              name: true,
              icon: true
            }
          },
          organization: {
            select: {
              name: true
            }
          }
        }
      });

      // Invalidate vehicle names cache
      cacheService.deletePattern('^vehicle-names:');

      return ApiResult.success(createdVehicleName, "Vehicle name created successfully", 201);

    } catch (error: any) {
      console.log("Error in createVehicleName", error);
      return ApiResult.error(error.message);
    }
  }

  public async getVehicleNames(query: IVehicleNameQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, isActive, organizationId, vehicleTypeId, sortBy = 'createdAt', sortOrder = 'desc' } = query as any;

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
      const cacheKey = cacheService.generateKey('vehicle-names', {
        page: parsedPage,
        limit: parsedLimit,
        search,
        isActive,
        organizationId,
        vehicleTypeId,
        sortBy,
        sortOrder
      });

      // Try to get from cache
      const cachedResult = cacheService.get<any>(cacheKey);
      if (cachedResult) {
        return ApiResult.success(cachedResult, "Vehicle names retrieved successfully (cached)");
      }

      const where: any = {};

      if (organizationId !== undefined && organizationId !== null && organizationId !== '') {
        const parsedOrgId = typeof organizationId === 'string' ? parseInt(organizationId as any, 10) : Number(organizationId);
        if (!Number.isNaN(parsedOrgId)) {
          where.organizationId = parsedOrgId;
        }
      }

      if (vehicleTypeId !== undefined && vehicleTypeId !== null && vehicleTypeId !== '') {
        const parsedVehicleTypeId = typeof vehicleTypeId === 'string' ? parseInt(vehicleTypeId as any, 10) : Number(vehicleTypeId);
        if (!Number.isNaN(parsedVehicleTypeId)) {
          where.vehicleTypeId = parsedVehicleTypeId;
        }
      }

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
          { name: { contains: search, mode: 'insensitive' } },
          { vehicleType: { name: { contains: search, mode: 'insensitive' } } },
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { vehicleId: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Validate sort fields
      const validSortFields = ['name', 'isActive', 'createdAt', 'updatedAt'];
      const validSortOrder = ['asc', 'desc'];
      const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const finalSortOrder = validSortOrder.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

      const orderBy: any = {};
      orderBy[finalSortBy] = finalSortOrder;

      const [vehicleNames, total] = await Promise.all([
        prisma.vehicleName.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            vehicleType: {
              select: {
                id: true,
                name: true,
                icon: true
              }
            },
            organization: {
              select: {
                name: true
              }
            }
          },
          orderBy
        }),
        prisma.vehicleName.count({ where })
      ]);

      const totalPages = Math.ceil(total / parsedLimit);
      const hasNextPage = parsedPage < totalPages;
      const hasPreviousPage = parsedPage > 1;

      const result = {
        vehicleNames,
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

      return ApiResult.success(result, "Vehicle names retrieved successfully");

    } catch (error: any) {
      console.log("Error in getVehicleNames", error);
      return ApiResult.error(error.message);
    }
  }

  public async getVehicleNameById(id: string): Promise<ApiResult> {
    try {
      const vehicleName = await prisma.vehicleName.findUnique({
        where: { id },
        include: {
          vehicleType: {
            select: {
              id: true,
              name: true,
              icon: true
            }
          },
          organization: {
            select: {
              name: true
            }
          }
        }
      });

      if (!vehicleName) {
        return ApiResult.error("Vehicle name not found", 404);
      }

      return ApiResult.success(vehicleName, "Vehicle name retrieved successfully");

    } catch (error: any) {
      console.log("Error in getVehicleNameById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateVehicleName(id: string, data: IUpdateVehicleNameRequest): Promise<ApiResult> {
    try {
      const existingVehicleName = await prisma.vehicleName.findUnique({
        where: { id }
      });

      if (!existingVehicleName) {
        return ApiResult.error("Vehicle name not found", 404);
      }

      // Check if vehicle type exists (if being updated)
      if (data.vehicleTypeId) {
        const vehicleType = await prisma.vehicleType.findUnique({
          where: { id: data.vehicleTypeId }
        });

        if (!vehicleType) {
          return ApiResult.error("Vehicle type not found", 404);
        }
      }

      // If name or vehicleTypeId is being updated, check for duplicates
      const finalVehicleTypeId = data.vehicleTypeId ?? existingVehicleName.vehicleTypeId;
      const finalName = data.name ?? existingVehicleName.name;

      if (data.name || data.vehicleTypeId) {
        const duplicateVehicleName = await prisma.vehicleName.findFirst({
          where: {
            name: finalName,
            vehicleTypeId: finalVehicleTypeId,
            organizationId: existingVehicleName.organizationId,
            id: { not: id }
          }
        });

        if (duplicateVehicleName) {
          return ApiResult.error("Vehicle name with this combination already exists", 400);
        }
      }

      const vehicleName = await prisma.vehicleName.update({
        where: { id },
        data: {
          name: data.name,
          vehicleTypeId: data.vehicleTypeId,
          make: data.make !== undefined ? (data.make || null) : undefined,
          model: data.model !== undefined ? (data.model || null) : undefined,
          year: data.year !== undefined ? (data.year || null) : undefined,
          vehicleId: data.vehicleId !== undefined ? (data.vehicleId || null) : undefined,
          isActive: data.isActive
        },
        include: {
          vehicleType: {
            select: {
              id: true,
              name: true,
              icon: true
            }
          },
          organization: {
            select: {
              name: true
            }
          }
        }
      });

      // Invalidate vehicle names cache
      cacheService.deletePattern('^vehicle-names:');

      return ApiResult.success(vehicleName, "Vehicle name updated successfully");

    } catch (error: any) {
      console.log("Error in updateVehicleName", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteVehicleName(id: string): Promise<ApiResult> {
    try {
      const existingVehicleName = await prisma.vehicleName.findUnique({
        where: { id },
        include: {
          collectorAssignments: {
            take: 1
          }
        }
      });

      if (!existingVehicleName) {
        return ApiResult.error("Vehicle name not found", 404);
      }

      // Check if vehicle name is being used in collector assignments
      if (existingVehicleName.collectorAssignments.length > 0) {
        return ApiResult.error("Cannot delete vehicle name as it is assigned to collectors", 400);
      }

      await prisma.vehicleName.delete({
        where: { id }
      });

      // Invalidate vehicle names cache
      cacheService.deletePattern('^vehicle-names:');

      return ApiResult.success(null, "Vehicle name deleted successfully");

    } catch (error: any) {
      console.log("Error in deleteVehicleName", error);
      return ApiResult.error(error.message);
    }
  }
}
