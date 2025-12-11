import { ICreateEmployeeRequest, IUpdateEmployeeRequest, IEmployeeQueryParams } from "../model/employee.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import bcrypt from 'bcrypt';

export class EmployeeService {
  public async createEmployee(data: ICreateEmployeeRequest): Promise<ApiResult> {
    try {
      // Verify role exists
      const role = await prisma.role.findUnique({
        where: { id: data.roleId }
      });

      if (!role) {
        return ApiResult.error("Role not found", 404);
      }

      if (!role.isActive) {
        return ApiResult.error("Cannot assign inactive role to employee", 400);
      }

      // Verify city exists if provided
      if (data.cityId) {
        const city = await prisma.city.findUnique({
          where: { id: data.cityId }
        });

        if (!city) {
          return ApiResult.error("City not found", 404);
        }
      }
      // Validate password is provided
      if (!data.password) {
        return ApiResult.error("Password is required", 400);
      }

      const passwordHash = await bcrypt.hash(data.password, 10);

      const employee = await prisma.employee.create({
        data: {
          organizationId: data.organizationId,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          roleId: data.roleId,
          cityId: data.cityId,
          passwordHash,
          isActive: true,
          completedPickups: 0,
          rating: 0
        },
        include: {
          organization: true,
          scrapYard: true,
          role: true,
          city: true
        }
      });

      return ApiResult.success(employee, "Employee created successfully", 201);
    } catch (error: any) {
      console.log("Error in createEmployee", error);
      return ApiResult.error(error.message);
    }
  }

  public async getEmployees(query: IEmployeeQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, roleId, cityId, isActive, organizationId } = query as any;

      const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
      const skip = (parsedPage - 1) * parsedLimit;

      const where: any = {};

      if (organizationId) {
        where.organizationId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
      }

      if (roleId) {
        where.roleId = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId;
      }

      if (cityId) {
        where.cityId = typeof cityId === 'string' ? parseInt(cityId, 10) : cityId;
      }

      if (isActive !== undefined) {
        // Convert string to boolean if needed
        if (typeof isActive === 'string') {
          where.isActive = isActive.toLowerCase() === 'true' || isActive === '1';
        } else {
          where.isActive = Boolean(isActive);
        }
      }

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [employees, total] = await Promise.all([
        prisma.employee.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            organization: true,
            scrapYard: true,
            role: true,
            city: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.employee.count({ where })
      ]);

      return ApiResult.success({
        employees,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }, "Employees retrieved successfully");
    } catch (error: any) {
      console.log("Error in getEmployees", error);
      return ApiResult.error(error.message);
    }
  }

  public async getEmployeeById(id: string): Promise<ApiResult> {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
          organization: true,
          scrapYard: true,
          role: true,
          city: true
        }
      });

      if (!employee) {
        return ApiResult.error("Employee not found", 404);
      }

      return ApiResult.success(employee, "Employee retrieved successfully");
    } catch (error: any) {
      console.log("Error in getEmployeeById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateEmployee(id: string, data: IUpdateEmployeeRequest): Promise<ApiResult> {
    try {
      const existingEmployee = await prisma.employee.findUnique({
        where: { id }
      });

      if (!existingEmployee) {
        return ApiResult.error("Employee not found", 404);
      }

      // Verify role exists if being updated
      if (data.roleId) {
        const role = await prisma.role.findUnique({
          where: { id: data.roleId }
        });

        if (!role) {
          return ApiResult.error("Role not found", 404);
        }

        if (!role.isActive) {
          return ApiResult.error("Cannot assign inactive role to employee", 400);
        }
      }

      // Verify city exists if being updated
      if (data.cityId !== undefined && data.cityId !== null) {
        const city = await prisma.city.findUnique({
          where: { id: data.cityId }
        });

        if (!city) {
          return ApiResult.error("City not found", 404);
        }
      }

      const updateData: any = { ...data };
      if (data.password) {
        updateData.passwordHash = await bcrypt.hash(data.password, 10);
        delete updateData.password;
      }

      const employee = await prisma.employee.update({
        where: { id },
        data: updateData,
        include: {
          organization: true,
          scrapYard: true,
          role: true,
          city: true
        }
      });

      return ApiResult.success(employee, "Employee updated successfully");
    } catch (error: any) {
      console.log("Error in updateEmployee", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteEmployee(id: string): Promise<ApiResult> {
    try {
      const existingEmployee = await prisma.employee.findUnique({
        where: { id }
      });

      if (!existingEmployee) {
        return ApiResult.error("Employee not found", 404);
      }

      await prisma.employee.delete({
        where: { id }
      });

      return ApiResult.success(null, "Employee deleted successfully");
    } catch (error: any) {
      console.log("Error in deleteEmployee", error);
      return ApiResult.error(error.message);
    }
  }

  public async activateEmployee(id: string): Promise<ApiResult> {
    try {
      const employee = await prisma.employee.update({
        where: { id },
        data: { isActive: true },
        include: {
          organization: true
        }
      });

      return ApiResult.success(employee, "Employee activated successfully");
    } catch (error: any) {
      console.log("Error in activateEmployee", error);
      return ApiResult.error(error.message);
    }
  }

  public async deactivateEmployee(id: string): Promise<ApiResult> {
    try {
      const employee = await prisma.employee.update({
        where: { id },
        data: { isActive: false },
        include: {
          organization: true
        }
      });

      return ApiResult.success(employee, "Employee deactivated successfully");
    } catch (error: any) {
      console.log("Error in deactivateEmployee", error);
      return ApiResult.error(error.message);
    }
  }

  public async getEmployeePerformance(id: string): Promise<ApiResult> {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
          orders: {
            where: {
              orderStatus: 'COMPLETED'
            }
          },
          reviews: true
        }
      });

      if (!employee) {
        return ApiResult.error("Employee not found", 404);
      }

      const totalPickups = employee.completedPickups;
      const completedOrders = employee.orders.length;
      const cancelledOrders = await prisma.order.count({
        where: {
          assignedCollectorId: id,
          orderStatus: 'CANCELLED'
        }
      });

      const totalRevenue = await prisma.payment.aggregate({
        where: {
          collectorId: id,
          status: 'PAID'
        },
        _sum: {
          amount: true
        }
      });

      const avgRating = employee.reviews.length > 0
        ? employee.reviews.reduce((sum, r) => sum + r.rating, 0) / employee.reviews.length
        : 0;

      return ApiResult.success({
        employeeId: id,
        totalPickups,
        averageRating: avgRating,
        completedOrders,
        cancelledOrders,
        totalRevenue: totalRevenue._sum.amount || 0
      }, "Employee performance retrieved successfully");
    } catch (error: any) {
      console.log("Error in getEmployeePerformance", error);
      return ApiResult.error(error.message);
    }
  }
}
