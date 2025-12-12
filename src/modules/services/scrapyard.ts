import { ICreateScrapYardRequest, IUpdateScrapYardRequest, IScrapYardQueryParams } from "../model/scrapyard.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";

export class ScrapYardService {
  public async createScrapYard(data: ICreateScrapYardRequest): Promise<ApiResult> {
    try {
      const scrapYard = await prisma.scrapYard.create({
        data: {
          organizationId: data.organizationId,
          yardName: data.yardName,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          assignedEmployeeIds: data.assignedEmployeeIds || [],
          operatingHours: data.operatingHours || {},
          isActive: data.isActive !== undefined ? data.isActive : true
        },
        include: {
          organization: true,
          employees: true
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
      const { page = 1, limit = 10, search, organizationId } = query as any;

      const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
      const skip = (parsedPage - 1) * parsedLimit;

      const where: any = {};

      if (organizationId) {
        where.organizationId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
      }

      if (search) {
        where.OR = [
          { yardName: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [scrapYards, total] = await Promise.all([
        prisma.scrapYard.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            organization: true,
            employees: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.scrapYard.count({ where })
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
                    role: {
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
            employees: assignedEmployees
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
      const scrapYard = await prisma.scrapYard.findUnique({
        where: { id },
        include: {
          organization: true,
          employees: true,
          orders: true
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
                role: {
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
        employees: assignedEmployees
      };

      return ApiResult.success(scrapYardWithEmployees, "Scrap yard retrieved successfully");
    } catch (error: any) {
      console.log("Error in getScrapYardById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateScrapYard(id: string, data: IUpdateScrapYardRequest): Promise<ApiResult> {
    try {
      const scrapYard = await prisma.scrapYard.update({
        where: { id },
        data,
        include: {
          organization: true,
          employees: true
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
      await prisma.scrapYard.delete({
        where: { id }
      });

      return ApiResult.success(null, "Scrap yard deleted successfully");
    } catch (error: any) {
      console.log("Error in deleteScrapYard", error);
      return ApiResult.error(error.message);
    }
  }
}
