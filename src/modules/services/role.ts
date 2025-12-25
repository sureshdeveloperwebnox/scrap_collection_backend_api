import { ICreateRoleRequest, IUpdateRoleRequest, IRoleQueryParams } from "../model/role.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { cacheService } from "../../utils/cache";

export class RoleService {
  public async createRole(data: ICreateRoleRequest): Promise<ApiResult> {
    try {
      // Check if role name already exists
      const existingRole = await prisma.roles.findUnique({
        where: { name: data.name }
      });

      if (existingRole) {
        return ApiResult.error("Role with this name already exists", 400);
      }

      const role = await prisma.roles.create({
        data: {
          name: data.name,
          description: data.description,
          isActive: data.isActive ?? true,
          updatedAt: new Date()
        }
      });

      // Invalidate roles cache
      cacheService.deletePattern('^roles:');

      return ApiResult.success(role, "Role created successfully", 201);

    } catch (error: any) {
      console.log("Error in createRole", error);
      return ApiResult.error(error.message);
    }
  }

  public async getRoles(query: IRoleQueryParams): Promise<ApiResult> {
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
      const cacheKey = cacheService.generateKey('roles', {
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
        return ApiResult.success(cachedResult, "Roles retrieved successfully (cached)");
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
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Validate sort fields
      const validSortFields = ['name', 'isActive', 'createdAt', 'updatedAt'];
      const validSortOrder = ['asc', 'desc'];
      const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const finalSortOrder = validSortOrder.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

      const orderBy: any = {};
      orderBy[finalSortBy] = finalSortOrder;

      const [roles, total] = await Promise.all([
        prisma.roles.findMany({
          where,
          skip,
          take: parsedLimit,
          orderBy,
          include: {
            _count: {
              select: {
                Employee: true
              }
            }
          }
        }),
        prisma.roles.count({ where })
      ]);

      const totalPages = Math.ceil(total / parsedLimit);
      const hasNextPage = parsedPage < totalPages;
      const hasPreviousPage = parsedPage > 1;

      const result = {
        roles,
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

      return ApiResult.success(result, "Roles retrieved successfully");

    } catch (error: any) {
      console.log("Error in getRoles", error);
      return ApiResult.error(error.message);
    }
  }

  public async getRoleById(id: number): Promise<ApiResult> {
    try {
      const role = await prisma.roles.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              Employee: true
            }
          }
        }
      });

      if (!role) {
        return ApiResult.error("Role not found", 404);
      }

      return ApiResult.success(role, "Role retrieved successfully");

    } catch (error: any) {
      console.log("Error in getRoleById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateRole(id: number, data: IUpdateRoleRequest): Promise<ApiResult> {
    try {
      const existingRole = await prisma.roles.findUnique({
        where: { id }
      });

      if (!existingRole) {
        return ApiResult.error("Role not found", 404);
      }

      // If name is being updated, check if it already exists
      if (data.name && data.name !== existingRole.name) {
        const duplicateRole = await prisma.roles.findUnique({
          where: { name: data.name }
        });

        if (duplicateRole) {
          return ApiResult.error("Role with this name already exists", 400);
        }
      }

      const role = await prisma.roles.update({
        where: { id },
        data
      });

      // Invalidate roles cache
      cacheService.deletePattern('^roles:');

      return ApiResult.success(role, "Role updated successfully");

    } catch (error: any) {
      console.log("Error in updateRole", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteRole(id: number): Promise<ApiResult> {
    try {
      const existingRole = await prisma.roles.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              Employee: true
            }
          }
        }
      });

      if (!existingRole) {
        return ApiResult.error("Role not found", 404);
      }

      // Check if any employees are assigned to this role
      if (existingRole._count.Employee > 0) {
        return ApiResult.error(
          `Cannot delete role. There are ${existingRole._count.Employee} employee(s) assigned to this role. Please reassign or remove those employees first.`,
          400
        );
      }

      await prisma.roles.delete({
        where: { id }
      });

      // Invalidate roles cache
      cacheService.deletePattern('^roles:');

      return ApiResult.success(null, "Role deleted successfully");

    } catch (error: any) {
      console.log("Error in deleteRole", error);
      return ApiResult.error(error.message);
    }
  }

  public async activateRole(id: number): Promise<ApiResult> {
    try {
      const role = await prisma.roles.update({
        where: { id },
        data: { isActive: true }
      });

      // Invalidate roles cache
      cacheService.deletePattern('^roles:');

      return ApiResult.success(role, "Role activated successfully");
    } catch (error: any) {
      console.log("Error in activateRole", error);
      return ApiResult.error(error.message);
    }
  }

  public async deactivateRole(id: number): Promise<ApiResult> {
    try {
      const role = await prisma.roles.update({
        where: { id },
        data: { isActive: false }
      });

      // Invalidate roles cache
      cacheService.deletePattern('^roles:');

      return ApiResult.success(role, "Role deactivated successfully");
    } catch (error: any) {
      console.log("Error in deactivateRole", error);
      return ApiResult.error(error.message);
    }
  }

  public async getRoleStats(): Promise<ApiResult> {
    try {
      const [total, active, inactive] = await Promise.all([
        prisma.roles.count(),
        prisma.roles.count({ where: { isActive: true } }),
        prisma.roles.count({ where: { isActive: false } })
      ]);

      return ApiResult.success({
        total,
        active,
        inactive
      }, "Role stats retrieved successfully");
    } catch (error: any) {
      console.log("Error in getRoleStats", error);
      return ApiResult.error(error.message);
    }
  }
}
