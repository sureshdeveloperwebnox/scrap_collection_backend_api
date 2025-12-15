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

      // Check if collector exists
      const collector = await prisma.employee.findUnique({
        where: { id: data.collectorId }
      });

      if (!collector) {
        return ApiResult.error("Collector not found", 404);
      }

      // Check if collector belongs to the organization
      if (collector.organizationId !== data.organizationId) {
        return ApiResult.error("Collector does not belong to this organization", 403);
      }

      // Check if vehicle name exists (if provided)
      if (data.vehicleNameId) {
        const vehicleName = await prisma.vehicleName.findUnique({
          where: { id: data.vehicleNameId }
        });

        if (!vehicleName) {
          return ApiResult.error("Vehicle name not found", 404);
        }

        if (vehicleName.organizationId !== data.organizationId) {
          return ApiResult.error("Vehicle name does not belong to this organization", 403);
        }
      }

      // Check if scrap yard exists (if provided)
      if (data.scrapYardId) {
        const scrapYard = await prisma.scrapYard.findUnique({
          where: { id: data.scrapYardId }
        });

        if (!scrapYard) {
          return ApiResult.error("Scrap yard not found", 404);
        }

        if (!scrapYard.isActive) {
          return ApiResult.error("Cannot assign to inactive scrap yard", 400);
        }
      }

      // Check if at least one assignment is provided
      if (!data.vehicleNameId && !data.cityId && !data.scrapYardId) {
        return ApiResult.error("Either vehicleNameId, cityId, or scrapYardId must be provided", 400);
      }

      // If scrapYardId is provided, update the collector's scrapYardId
      if (data.scrapYardId) {
        await prisma.employee.update({
          where: { id: data.collectorId },
          data: { scrapYardId: data.scrapYardId }
        });
      }

      // Check if assignment already exists (only if creating a vehicle/city assignment)
      if (data.vehicleNameId || data.cityId) {
        const existingAssignment = await prisma.collectorAssignment.findFirst({
          where: {
            collectorId: data.collectorId,
            vehicleNameId: data.vehicleNameId || null,
            cityId: data.cityId || null,
            organizationId: data.organizationId
          }
        });

        if (existingAssignment) {
          return ApiResult.error("This assignment already exists", 400);
        }
      }

      // Create assignment record only if vehicle or city is involved
      // If only scrap yard is assigned, we just return the updated collector info
      let assignment;

      if (data.vehicleNameId || data.cityId) {
        assignment = await prisma.collectorAssignment.create({
          data: {
            organizationId: data.organizationId,
            collectorId: data.collectorId,
            vehicleNameId: data.vehicleNameId || null,
            cityId: data.cityId || null,
            isActive: data.isActive ?? true
          },
          include: {
            collector: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                scrapYard: {
                  select: {
                    id: true,
                    yardName: true,
                    address: true
                  }
                }
              }
            },
            vehicleName: {
              select: {
                id: true,
                name: true,
                vehicleType: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            city: {
              select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true
              }
            },
            organization: {
              select: {
                name: true
              }
            }
          }
        });
      } else {
        // If only scrap yard was assigned, we construct a mock assignment object to return
        // or we fetch the collector details to return consistent structure
        // However, the frontend expects an assignment object. 
        // But wait, if we don't create a CollectorAssignment record, it won't show up in the assignments list.
        // The user wants it to show up in the assignments list.
        // But CollectorAssignment doesn't have scrapYardId.
        // If the user selects ONLY a scrap yard, and we don't create a CollectorAssignment, 
        // then it won't appear in the "Assignments" tab which iterates over `assignments`.

        // If the user wants it to appear in Assignments tab, we might need to create a dummy assignment?
        // Or maybe the user ALWAYS assigns a vehicle?
        // The UI says "Vehicle (Optional)".

        // If I create a CollectorAssignment with null vehicle and null city, it might be valid?
        // The schema says vehicleNameId and cityId are optional.
        // Let's check schema:
        // vehicleNameId  String?
        // cityId         Int?

        // So yes, we can create a CollectorAssignment with both null if we want to track the "assignment event".
        // But `CollectorAssignment` doesn't store the scrap yard. 
        // If we create one with both null, it's an "empty" assignment record.

        // However, the user said "in collectors assignments table the workzone was not seen... the zone was scrap yard".
        // This implies they want to see the scrap yard in the table.
        // If I create an assignment with null vehicle/city, but the collector has a scrap yard, 
        // I can display the scrap yard in the table.

        assignment = await prisma.collectorAssignment.create({
          data: {
            organizationId: data.organizationId,
            collectorId: data.collectorId,
            vehicleNameId: data.vehicleNameId || null,
            cityId: data.cityId || null,
            isActive: data.isActive ?? true
          },
          include: {
            collector: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                scrapYard: {
                  select: {
                    id: true,
                    yardName: true,
                    address: true
                  }
                }
              }
            },
            vehicleName: {
              select: {
                id: true,
                name: true,
                vehicleType: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            city: {
              select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true
              }
            },
            organization: {
              select: {
                name: true
              }
            }
          }
        });
      }

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
      const { page = 1, limit = 10, search, isActive, organizationId, collectorId, vehicleNameId, cityId, sortBy = 'createdAt', sortOrder = 'desc' } = query as any;

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
        vehicleNameId,
        cityId,
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

      if (vehicleNameId !== undefined && vehicleNameId !== null && vehicleNameId !== '') {
        where.vehicleNameId = vehicleNameId;
      }

      if (cityId !== undefined && cityId !== null && cityId !== '') {
        const parsedCityId = typeof cityId === 'string' ? parseInt(cityId as any, 10) : Number(cityId);
        if (!Number.isNaN(parsedCityId)) {
          where.cityId = parsedCityId;
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
          { collector: { fullName: { contains: search, mode: 'insensitive' } } },
          { vehicleName: { name: { contains: search, mode: 'insensitive' } } },
          { city: { name: { contains: search, mode: 'insensitive' } } }
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
        prisma.collectorAssignment.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            collector: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                scrapYard: {
                  select: {
                    id: true,
                    yardName: true,
                    address: true
                  }
                }
              }
            },
            vehicleName: {
              select: {
                id: true,
                name: true,
                vehicleType: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            city: {
              select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true
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
        prisma.collectorAssignment.count({ where })
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
      const assignment = await prisma.collectorAssignment.findUnique({
        where: { id },
        include: {
          collector: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              scrapYard: {
                select: {
                  id: true,
                  yardName: true,
                  address: true
                }
              }
            }
          },
          vehicleName: {
            select: {
              id: true,
              name: true,
              vehicleType: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          city: {
            select: {
              id: true,
              name: true,
              latitude: true,
              longitude: true
            }
          },
          organization: {
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
      const existingAssignment = await prisma.collectorAssignment.findUnique({
        where: { id }
      });

      if (!existingAssignment) {
        return ApiResult.error("Collector assignment not found", 404);
      }

      // Check if vehicle name exists (if being updated)
      if (data.vehicleNameId !== undefined && data.vehicleNameId !== null) {
        const vehicleName = await prisma.vehicleName.findUnique({
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
        const city = await prisma.city.findUnique({
          where: { id: data.cityId }
        });

        if (!city) {
          return ApiResult.error("City not found", 404);
        }
      }

      // Ensure at least one assignment remains
      const finalVehicleNameId = data.vehicleNameId !== undefined ? data.vehicleNameId : existingAssignment.vehicleNameId;
      const finalCityId = data.cityId !== undefined ? data.cityId : existingAssignment.cityId;

      if (!finalVehicleNameId && !finalCityId) {
        return ApiResult.error("Either vehicleNameId or cityId must be provided", 400);
      }

      // Check for duplicate assignment
      if (data.vehicleNameId !== undefined || data.cityId !== undefined) {
        const duplicateAssignment = await prisma.collectorAssignment.findFirst({
          where: {
            collectorId: existingAssignment.collectorId,
            vehicleNameId: finalVehicleNameId || null,
            cityId: finalCityId || null,
            organizationId: existingAssignment.organizationId,
            id: { not: id }
          }
        });

        if (duplicateAssignment) {
          return ApiResult.error("This assignment already exists", 400);
        }
      }

      const assignment = await prisma.collectorAssignment.update({
        where: { id },
        data: {
          vehicleNameId: data.vehicleNameId !== undefined ? data.vehicleNameId : undefined,
          cityId: data.cityId !== undefined ? data.cityId : undefined,
          isActive: data.isActive
        },
        include: {
          collector: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              scrapYard: {
                select: {
                  id: true,
                  yardName: true,
                  address: true
                }
              }
            }
          },
          vehicleName: {
            select: {
              id: true,
              name: true,
              vehicleType: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          city: {
            select: {
              id: true,
              name: true,
              latitude: true,
              longitude: true
            }
          },
          organization: {
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
      const existingAssignment = await prisma.collectorAssignment.findUnique({
        where: { id }
      });

      if (!existingAssignment) {
        return ApiResult.error("Collector assignment not found", 404);
      }

      await prisma.collectorAssignment.delete({
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
