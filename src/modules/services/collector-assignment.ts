import { ICreateCollectorAssignmentRequest, IUpdateCollectorAssignmentRequest, ICollectorAssignmentQueryParams } from "../model/collector-assignment.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { cacheService } from "../../utils/cache";

export class CollectorAssignmentService {
  public async createCollectorAssignment(data: ICreateCollectorAssignmentRequest): Promise<ApiResult> {
    try {
      // Check if organization exists
      const organization = await prisma.organization.findUnique({
        where: { id: data.organizationId }
      });

      if (!organization) {
        return ApiResult.error("Organization not found", 404);
      }

      // Check if collector exists (if provided)
      let collector;
      if (data.collectorId) {
        collector = await prisma.employee.findUnique({
          where: { id: data.collectorId }
        });

        if (!collector) {
          return ApiResult.error("Collector not found", 404);
        }

        if (collector.organizationId !== data.organizationId) {
          return ApiResult.error("Collector does not belong to this organization", 403);
        }
      }

      // Check if crew exists (if provided)
      let crew;
      if (data.crewId) {
        crew = await prisma.crews.findUnique({
          where: { id: data.crewId }
        });

        if (!crew) {
          return ApiResult.error("Crew not found", 404);
        }
      }

      if (!data.collectorId && !data.crewId) {
        return ApiResult.error("Either collector or crew must be provided", 400);
      }

      // Check if vehicle name exists (if provided)
      if (data.vehicleNameId) {
        const vehicleName = await prisma.vehicle_names.findUnique({
          where: { id: data.vehicleNameId }
        });

        if (!vehicleName) {
          return ApiResult.error("Vehicle name not found", 404);
        }

        if (vehicleName.organizationId !== data.organizationId) {
          return ApiResult.error("Vehicle name does not belong to this organization", 403);
        }
      }

      // Check if city exists (if provided)
      if (data.cityId) {
        const city = await prisma.cities.findUnique({
          where: { id: data.cityId }
        });

        if (!city) {
          return ApiResult.error("City not found", 404);
        }
      }

      // Check if scrap yard exists (if provided)
      if (data.scrapYardId) {
        const scrapYard = await prisma.scrap_yards.findUnique({
          where: { id: data.scrapYardId }
        });

        if (!scrapYard) {
          return ApiResult.error("Scrap yard not found", 404);
        }

        if (scrapYard.organizationId !== data.organizationId) {
          return ApiResult.error("Scrap yard does not belong to this organization", 403);
        }
      }

      // Check if assignment already exists
      const existingAssignment = await prisma.collector_assignments.findFirst({
        where: {
          collectorId: data.collectorId || null,
          crewId: data.crewId || null,
          vehicleNameId: data.vehicleNameId || null,
          cityId: data.cityId || null,
          scrapYardId: data.scrapYardId || null,
          organizationId: data.organizationId
        }
      });

      if (existingAssignment) {
        return ApiResult.error("This assignment already exists", 400);
      }

      const assignment = await prisma.collector_assignments.create({
        data: {
          organizationId: data.organizationId,
          collectorId: data.collectorId || null,
          crewId: data.crewId || null,
          vehicleNameId: data.vehicleNameId || null,
          cityId: data.cityId || null,
          scrapYardId: data.scrapYardId || null,
          isActive: data.isActive ?? true
        },
        include: {
          Employee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          crews: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          vehicle_names: {
            select: {
              id: true,
              name: true,
              vehicle_types: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          cities: {
            select: {
              id: true,
              name: true,
              latitude: true,
              longitude: true
            }
          },
          scrap_yards: {
            select: {
              id: true,
              yardName: true,
              latitude: true,
              longitude: true
            }
          },
          Organization: {
            select: {
              name: true
            }
          }
        }
      });

      // Invalidate collector assignments cache
      cacheService.deletePattern('^collector-assignments:');

      return ApiResult.success(assignment, "Collector assignment created successfully", 201);

    } catch (error: any) {
      console.log("Error in createCollectorAssignment", error);
      return ApiResult.error(error.message);
    }
  }

  public async getCollectorAssignments(query: ICollectorAssignmentQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, isActive, organizationId, collectorId, crewId, vehicleNameId, cityId, sortBy = 'createdAt', sortOrder = 'desc' } = query as any;

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
      const cacheKey = cacheService.generateKey('collector-assignments', {
        page: parsedPage,
        limit: parsedLimit,
        search,
        isActive,
        organizationId,
        collectorId,
        crewId,
        vehicleNameId,
        cityId,
        scrapYardId: (query as any).scrapYardId,
        sortBy,
        sortOrder
      });

      // Try to get from cache
      const cachedResult = cacheService.get<any>(cacheKey);
      if (cachedResult) {
        return ApiResult.success(cachedResult, "Collector assignments retrieved successfully (cached)");
      }

      const where: any = {};

      if (organizationId !== undefined && organizationId !== null && organizationId !== '') {
        const parsedOrgId = typeof organizationId === 'string' ? parseInt(organizationId as any, 10) : Number(organizationId);
        if (!Number.isNaN(parsedOrgId)) {
          where.organizationId = parsedOrgId;
        }
      }

      if (collectorId !== undefined && collectorId !== null && collectorId !== '') {
        where.collectorId = collectorId;
      }

      if (crewId !== undefined && crewId !== null && crewId !== '') {
        where.crewId = crewId;
      }

      if (vehicleNameId !== undefined && vehicleNameId !== null && vehicleNameId !== '') {
        where.vehicleNameId = vehicleNameId;
      }

      if (cityId !== undefined && cityId !== null && cityId !== '') {
        const parsedCityId = typeof cityId === 'string' ? parseInt(cityId as any, 10) : Number(cityId);
        if (!Number.isNaN(parsedCityId)) {
          where.cityId = parsedCityId;
        }
      }

      const queryScrapYardId = (query as any).scrapYardId;
      if (queryScrapYardId !== undefined && queryScrapYardId !== null && queryScrapYardId !== '') {
        where.scrapYardId = queryScrapYardId;
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
          { Employee: { fullName: { contains: search, mode: 'insensitive' } } },
          { crews: { name: { contains: search, mode: 'insensitive' } } },
          { vehicle_names: { name: { contains: search, mode: 'insensitive' } } },
          { cities: { name: { contains: search, mode: 'insensitive' } } },
          { scrap_yards: { yardName: { contains: search, mode: 'insensitive' } } }
        ];
      }

      // Validate sort fields
      const validSortFields = ['createdAt', 'updatedAt'];
      const validSortOrder = ['asc', 'desc'];
      const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const finalSortOrder = validSortOrder.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

      const orderBy: any = {};
      orderBy[finalSortBy] = finalSortOrder;

      const [assignments, total] = await Promise.all([
        prisma.collector_assignments.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            Employee: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true
              }
            },
            crews: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            vehicle_names: {
              select: {
                id: true,
                name: true,
                vehicle_types: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            cities: {
              select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true
              }
            },
            scrap_yards: {
              select: {
                id: true,
                yardName: true,
                latitude: true,
                longitude: true
              }
            },
            Organization: {
              select: {
                name: true
              }
            }
          },
          orderBy
        }),
        prisma.collector_assignments.count({ where })
      ]);

      const totalPages = Math.ceil(total / parsedLimit);
      const hasNextPage = parsedPage < totalPages;
      const hasPreviousPage = parsedPage > 1;

      const result = {
        assignments,
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

      return ApiResult.success(result, "Collector assignments retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCollectorAssignments", error);
      return ApiResult.error(error.message);
    }
  }

  public async getCollectorAssignmentById(id: string): Promise<ApiResult> {
    try {
      const assignment = await prisma.collector_assignments.findUnique({
        where: { id },
        include: {
          Employee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          crews: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          vehicle_names: {
            select: {
              id: true,
              name: true,
              vehicle_types: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          cities: {
            select: {
              id: true,
              name: true,
              latitude: true,
              longitude: true
            }
          },
          Organization: {
            select: {
              name: true
            }
          }
        }
      });

      if (!assignment) {
        return ApiResult.error("Collector assignment not found", 404);
      }

      return ApiResult.success(assignment, "Collector assignment retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCollectorAssignmentById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateCollectorAssignment(id: string, data: IUpdateCollectorAssignmentRequest): Promise<ApiResult> {
    try {
      const existingAssignment = await prisma.collector_assignments.findUnique({
        where: { id }
      });

      if (!existingAssignment) {
        return ApiResult.error("Collector assignment not found", 404);
      }

      // Check if vehicle name exists (if being updated)
      if (data.vehicleNameId !== undefined && data.vehicleNameId !== null) {
        const vehicleName = await prisma.vehicle_names.findUnique({
          where: { id: data.vehicleNameId }
        });

        if (!vehicleName) {
          return ApiResult.error("Vehicle name not found", 404);
        }

        if (vehicleName.organizationId !== existingAssignment.organizationId) {
          return ApiResult.error("Vehicle name does not belong to this organization", 403);
        }
      }

      // Check if city exists (if being updated)
      if (data.cityId !== undefined && data.cityId !== null) {
        const city = await prisma.cities.findUnique({
          where: { id: data.cityId }
        });

        if (!city) {
          return ApiResult.error("City not found", 404);
        }
      }

      // Check if scrap yard exists (if being updated)
      if (data.scrapYardId !== undefined && data.scrapYardId !== null) {
        const scrapYard = await prisma.scrap_yards.findUnique({
          where: { id: data.scrapYardId }
        });

        if (!scrapYard) {
          return ApiResult.error("Scrap yard not found", 404);
        }

        if (scrapYard.organizationId !== existingAssignment.organizationId) {
          return ApiResult.error("Scrap yard does not belong to this organization", 403);
        }
      }

      // Ensure at least one assignment remains
      const finalVehicleNameId = data.vehicleNameId !== undefined ? data.vehicleNameId : existingAssignment.vehicleNameId;
      const finalCityId = data.cityId !== undefined ? data.cityId : existingAssignment.cityId;
      const finalScrapYardId = data.scrapYardId !== undefined ? data.scrapYardId : existingAssignment.scrapYardId;

      if (!finalVehicleNameId && !finalCityId && !finalScrapYardId) {
        return ApiResult.error("At least one assignment (vehicle, city, or scrap yard) must be provided", 400);
      }

      // Check for duplicate assignment
      if (data.vehicleNameId !== undefined || data.cityId !== undefined || data.scrapYardId !== undefined) {
        const duplicateAssignment = await prisma.collector_assignments.findFirst({
          where: {
            collectorId: existingAssignment.collectorId,
            vehicleNameId: finalVehicleNameId || null,
            cityId: finalCityId || null,
            scrapYardId: finalScrapYardId || null,
            organizationId: existingAssignment.organizationId,
            id: { not: id }
          }
        });

        if (duplicateAssignment) {
          return ApiResult.error("This assignment already exists for another entry", 400);
        }
      }

      const assignment = await prisma.collector_assignments.update({
        where: { id },
        data: {
          vehicleNameId: data.vehicleNameId !== undefined ? data.vehicleNameId : undefined,
          cityId: data.cityId !== undefined ? data.cityId : undefined,
          scrapYardId: data.scrapYardId !== undefined ? data.scrapYardId : undefined,
          isActive: data.isActive
        },
        include: {
          Employee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          crews: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          vehicle_names: {
            select: {
              id: true,
              name: true,
              vehicle_types: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          cities: {
            select: {
              id: true,
              name: true,
              latitude: true,
              longitude: true
            }
          },
          scrap_yards: {
            select: {
              id: true,
              yardName: true,
              latitude: true,
              longitude: true
            }
          },
          Organization: {
            select: {
              name: true
            }
          }
        }
      });

      // Invalidate collector assignments cache
      cacheService.deletePattern('^collector-assignments:');

      return ApiResult.success(assignment, "Collector assignment updated successfully");

    } catch (error: any) {
      console.log("Error in updateCollectorAssignment", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteCollectorAssignment(id: string): Promise<ApiResult> {
    try {
      const existingAssignment = await prisma.collector_assignments.findUnique({
        where: { id }
      });

      if (!existingAssignment) {
        return ApiResult.error("Collector assignment not found", 404);
      }

      await prisma.collector_assignments.delete({
        where: { id }
      });

      // Invalidate collector assignments cache
      cacheService.deletePattern('^collector-assignments:');

      return ApiResult.success(null, "Collector assignment deleted successfully");

    } catch (error: any) {
      console.log("Error in deleteCollectorAssignment", error);
      return ApiResult.error(error.message);
    }
  }
}
