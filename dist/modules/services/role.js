"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const cache_1 = require("../../utils/cache");
class RoleService {
    async createRole(data) {
        var _a;
        try {
            // Check if role name already exists
            const existingRole = await config_1.prisma.role.findUnique({
                where: { name: data.name }
            });
            if (existingRole) {
                return api_result_1.ApiResult.error("Role with this name already exists", 400);
            }
            const role = await config_1.prisma.role.create({
                data: {
                    name: data.name,
                    description: data.description,
                    isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true
                }
            });
            // Invalidate roles cache
            cache_1.cacheService.deletePattern('^roles:');
            return api_result_1.ApiResult.success(role, "Role created successfully", 201);
        }
        catch (error) {
            console.log("Error in createRole", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getRoles(query) {
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
            const cacheKey = cache_1.cacheService.generateKey('roles', {
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
                return api_result_1.ApiResult.success(cachedResult, "Roles retrieved successfully (cached)");
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
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }
            // Validate sort fields
            const validSortFields = ['name', 'isActive', 'createdAt', 'updatedAt'];
            const validSortOrder = ['asc', 'desc'];
            const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
            const finalSortOrder = validSortOrder.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';
            const orderBy = {};
            orderBy[finalSortBy] = finalSortOrder;
            const [roles, total] = await Promise.all([
                config_1.prisma.role.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    orderBy,
                    include: {
                        _count: {
                            select: {
                                employees: true
                            }
                        }
                    }
                }),
                config_1.prisma.role.count({ where })
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
            cache_1.cacheService.set(cacheKey, result, 3 * 60 * 1000);
            return api_result_1.ApiResult.success(result, "Roles retrieved successfully");
        }
        catch (error) {
            console.log("Error in getRoles", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getRoleById(id) {
        try {
            const role = await config_1.prisma.role.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            employees: true
                        }
                    }
                }
            });
            if (!role) {
                return api_result_1.ApiResult.error("Role not found", 404);
            }
            return api_result_1.ApiResult.success(role, "Role retrieved successfully");
        }
        catch (error) {
            console.log("Error in getRoleById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateRole(id, data) {
        try {
            const existingRole = await config_1.prisma.role.findUnique({
                where: { id }
            });
            if (!existingRole) {
                return api_result_1.ApiResult.error("Role not found", 404);
            }
            // If name is being updated, check if it already exists
            if (data.name && data.name !== existingRole.name) {
                const duplicateRole = await config_1.prisma.role.findUnique({
                    where: { name: data.name }
                });
                if (duplicateRole) {
                    return api_result_1.ApiResult.error("Role with this name already exists", 400);
                }
            }
            const role = await config_1.prisma.role.update({
                where: { id },
                data
            });
            // Invalidate roles cache
            cache_1.cacheService.deletePattern('^roles:');
            return api_result_1.ApiResult.success(role, "Role updated successfully");
        }
        catch (error) {
            console.log("Error in updateRole", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteRole(id) {
        try {
            const existingRole = await config_1.prisma.role.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            employees: true
                        }
                    }
                }
            });
            if (!existingRole) {
                return api_result_1.ApiResult.error("Role not found", 404);
            }
            // Check if any employees are assigned to this role
            if (existingRole._count.employees > 0) {
                return api_result_1.ApiResult.error(`Cannot delete role. There are ${existingRole._count.employees} employee(s) assigned to this role. Please reassign or remove those employees first.`, 400);
            }
            await config_1.prisma.role.delete({
                where: { id }
            });
            // Invalidate roles cache
            cache_1.cacheService.deletePattern('^roles:');
            return api_result_1.ApiResult.success(null, "Role deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteRole", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async activateRole(id) {
        try {
            const role = await config_1.prisma.role.update({
                where: { id },
                data: { isActive: true }
            });
            // Invalidate roles cache
            cache_1.cacheService.deletePattern('^roles:');
            return api_result_1.ApiResult.success(role, "Role activated successfully");
        }
        catch (error) {
            console.log("Error in activateRole", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deactivateRole(id) {
        try {
            const role = await config_1.prisma.role.update({
                where: { id },
                data: { isActive: false }
            });
            // Invalidate roles cache
            cache_1.cacheService.deletePattern('^roles:');
            return api_result_1.ApiResult.success(role, "Role deactivated successfully");
        }
        catch (error) {
            console.log("Error in deactivateRole", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.RoleService = RoleService;
