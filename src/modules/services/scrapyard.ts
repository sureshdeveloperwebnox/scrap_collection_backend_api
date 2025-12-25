import { ICreateScrapYardRequest, IUpdateScrapYardRequest, IScrapYardQueryParams } from "../model/scrapyard.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";

export class ScrapYardService {
  public async createScrapYard(data: ICreateScrapYardRequest): Promise<ApiResult> {
    try {
      const scrapYard = await prisma.scrap_yards.create({
        data: {
          organizationId: data.organizationId,
          yardName: data.yardName,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          assignedEmployeeIds: data.assignedEmployeeIds || [],
          managerId: data.managerId,
          operatingHours: data.operatingHours || {},
          isActive: data.isActive !== undefined ? data.isActive : true
        },
        include: {
          Organization: true,
          Employee: true
        }
      });

      return ApiResult.success(scrapYard, "Scrap yard created successfully", 201);
    } catch (error: any) {
      console.log("Error in createScrapYard", error);
      return ApiResult.error(error.message);
    }
  }

  public async getScrapYards(query: IScrapYardQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, organizationId, status } = query as any;

      const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
      const skip = (parsedPage - 1) * parsedLimit;

      const where: any = {};

      if (organizationId) {
        where.organizationId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
      }

      // Add status filter
      if (status !== undefined && status !== null && status !== '') {
        // Convert string 'true'/'false' to boolean
        if (status === 'true' || status === true) {
          where.isActive = true;
        } else if (status === 'false' || status === false) {
          where.isActive = false;
        }
      }

      if (search) {
        where.OR = [
          { yardName: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [scrapYards, total] = await Promise.all([
        prisma.scrap_yards.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            Organization: true,
            Employee: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.scrap_yards.count({ where })
      ]);

      // Fetch assigned employees (managers) based on assignedEmployeeIds
      const scrapYardsWithEmployees = await Promise.all(
        scrapYards.map(async (yard) => {
          let assignedEmployees: any[] = [];

          // Parse assignedEmployeeIds from JSON
          if (yard.assignedEmployeeIds) {
            try {
              const employeeIds = Array.isArray(yard.assignedEmployeeIds)
                ? yard.assignedEmployeeIds
                : JSON.parse(yard.assignedEmployeeIds as string);

              if (Array.isArray(employeeIds) && employeeIds.length > 0) {
                // Fetch employees by their IDs
                assignedEmployees = await prisma.employee.findMany({
                  where: {
                    id: { in: employeeIds }
                  },
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    roles: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                        isActive: true
                      }
                    }
                  }
                });
              }
            } catch (error) {
              console.error('Error parsing assignedEmployeeIds:', error);
            }
          }

          return {
            ...yard,
            employees: assignedEmployees,
            managerId: yard.managerId
          };
        })
      );

      return ApiResult.success({
        scrapYards: scrapYardsWithEmployees,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }, "Scrap yards retrieved successfully");
    } catch (error: any) {
      console.log("Error in getScrapYards", error);
      return ApiResult.error(error.message);
    }
  }

  public async getScrapYardById(id: string): Promise<ApiResult> {
    try {
      const scrapYard = await prisma.scrap_yards.findUnique({
        where: { id },
        include: {
          Organization: true,
          Employee: true,
          Order: true
        }
      });

      if (!scrapYard) {
        return ApiResult.error("Scrap yard not found", 404);
      }

      // Fetch assigned employees (managers) based on assignedEmployeeIds
      let assignedEmployees: any[] = [];

      if (scrapYard.assignedEmployeeIds) {
        try {
          const employeeIds = Array.isArray(scrapYard.assignedEmployeeIds)
            ? scrapYard.assignedEmployeeIds
            : JSON.parse(scrapYard.assignedEmployeeIds as string);

          if (Array.isArray(employeeIds) && employeeIds.length > 0) {
            assignedEmployees = await prisma.employee.findMany({
              where: {
                id: { in: employeeIds }
              },
              select: {
                id: true,
                fullName: true,
                email: true,
                roles: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    isActive: true
                  }
                }
              }
            });
          }
        } catch (error) {
          console.error('Error parsing assignedEmployeeIds:', error);
        }
      }

      const scrapYardWithEmployees = {
        ...scrapYard,
        employees: assignedEmployees,
        managerId: scrapYard.managerId
      };

      return ApiResult.success(scrapYardWithEmployees, "Scrap yard retrieved successfully");
    } catch (error: any) {
      console.log("Error in getScrapYardById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateScrapYard(id: string, data: IUpdateScrapYardRequest): Promise<ApiResult> {
    try {
      const scrapYard = await prisma.scrap_yards.update({
        where: { id },
        data,
        include: {
          Organization: true,
          Employee: true
        }
      });

      return ApiResult.success(scrapYard, "Scrap yard updated successfully");
    } catch (error: any) {
      console.log("Error in updateScrapYard", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteScrapYard(id: string): Promise<ApiResult> {
    try {
      await prisma.scrap_yards.delete({
        where: { id }
      });

      return ApiResult.success(null, "Scrap yard deleted successfully");
    } catch (error: any) {
      console.log("Error in deleteScrapYard", error);
      return ApiResult.error(error.message);
    }
  }
  public async getScrapYardStats(query: any): Promise<ApiResult> {
    try {
      const { organizationId } = query;
      const where: any = {};
      if (organizationId) {
        where.organizationId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
      }

      const stats = await prisma.scrap_yards.groupBy({
        by: ['isActive'],
        where,
        _count: {
          isActive: true
        }
      });

      const totalValue = await prisma.scrap_yards.count({ where });

      const statsMap = {
        total: totalValue,
        active: 0,
        inactive: 0,
        maintenance: 0,
        byState: {}
      };

      stats.forEach((stat: any) => {
        if (stat.isActive) {
          statsMap.active = stat._count.isActive;
        } else {
          statsMap.inactive = stat._count.isActive;
        }
      });

      return ApiResult.success(statsMap, "Scrap yard statistics retrieved successfully");
    } catch (error: any) {
      console.log("Error in getScrapYardStats", error);
      return ApiResult.error(error.message);
    }
  }
}
