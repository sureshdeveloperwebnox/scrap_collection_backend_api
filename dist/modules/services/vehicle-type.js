"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleTypeService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const cache_1 = require("../../utils/cache");
class VehicleTypeService {
    async createVehicleType(data) {
        var _a;
        try {
            // Check if organization exists (if provided)
            if (data.organizationId) {
                const organization = await config_1.prisma.organization.findUnique({
                    where: { id: data.organizationId }
                });
                if (!organization) {
                    return api_result_1.ApiResult.error("Organization not found", 404);
                }
            }
            // Check if vehicle type name already exists for this organization
            const existingVehicleType = await config_1.prisma.vehicle_types.findFirst({
                where: {
                    name: data.name,
                    organizationId: data.organizationId || null
                }
            });
            if (existingVehicleType) {
                return api_result_1.ApiResult.error("Vehicle type with this name already exists for this organization", 400);
            }
            const vehicleType = await config_1.prisma.vehicle_types.create({
                data: {
                    organizationId: data.organizationId || null,
                    name: data.name,
                    isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true
                },
                include: {
                    Organization: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            // Invalidate vehicle types cache and stats cache
            cache_1.cacheService.deletePattern('^vehicle-types:');
            cache_1.cacheService.deletePattern('^vehicle-type-stats:');
            return api_result_1.ApiResult.success(vehicleType, "Vehicle type created successfully", 201);
        }
        catch (error) {
            console.log("Error in createVehicleType", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getVehicleTypes(query) {
        try {
            const { page = 1, limit = 10, search, isActive, organizationId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
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
            const cacheKey = cache_1.cacheService.generateKey('vehicle-types', {
                page: parsedPage,
                limit: parsedLimit,
                search,
                isActive,
                organizationId,
                sortBy,
                sortOrder
            });
            // Try to get from cache
            const cachedResult = cache_1.cacheService.get(cacheKey);
            if (cachedResult) {
                return api_result_1.ApiResult.success(cachedResult, "Vehicle types retrieved successfully (cached)");
            }
            const where = {};
            // Coerce organizationId to number if present
            if (organizationId !== undefined && organizationId !== null && organizationId !== '') {
                const parsedOrgId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : Number(organizationId);
                if (!Number.isNaN(parsedOrgId)) {
                    where.organizationId = parsedOrgId;
                }
            }
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
                    { name: { contains: search, mode: 'insensitive' } }
                ];
            }
            // Validate sort fields
            const validSortFields = ['name', 'isActive', 'createdAt', 'updatedAt'];
            const validSortOrder = ['asc', 'desc'];
            const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
            const finalSortOrder = validSortOrder.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';
            const orderBy = {};
            orderBy[finalSortBy] = finalSortOrder;
            const [vehicleTypes, total] = await Promise.all([
                config_1.prisma.vehicle_types.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        Organization: {
                            select: {
                                name: true
                            }
                        }
                    },
                    orderBy
                }),
                config_1.prisma.vehicle_types.count({ where })
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
            cache_1.cacheService.set(cacheKey, result, 3 * 60 * 1000);
            return api_result_1.ApiResult.success(result, "Vehicle types retrieved successfully");
        }
        catch (error) {
            console.log("Error in getVehicleTypes", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getVehicleTypeById(id) {
        try {
            const vehicleType = await config_1.prisma.vehicle_types.findUnique({
                where: { id },
                include: {
                    Organization: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            if (!vehicleType) {
                return api_result_1.ApiResult.error("Vehicle type not found", 404);
            }
            return api_result_1.ApiResult.success(vehicleType, "Vehicle type retrieved successfully");
        }
        catch (error) {
            console.log("Error in getVehicleTypeById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateVehicleType(id, data) {
        try {
            const existingVehicleType = await config_1.prisma.vehicle_types.findUnique({
                where: { id }
            });
            if (!existingVehicleType) {
                return api_result_1.ApiResult.error("Vehicle type not found", 404);
            }
            // If name is being updated, check if it already exists for this organization
            if (data.name && data.name !== existingVehicleType.name) {
                const duplicateVehicleType = await config_1.prisma.vehicle_types.findFirst({
                    where: {
                        name: data.name,
                        organizationId: existingVehicleType.organizationId,
                        id: { not: id }
                    }
                });
                if (duplicateVehicleType) {
                    return api_result_1.ApiResult.error("Vehicle type with this name already exists for this organization", 400);
                }
            }
            const vehicleType = await config_1.prisma.vehicle_types.update({
                where: { id },
                data,
                include: {
                    Organization: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            // Invalidate vehicle types cache and stats cache
            cache_1.cacheService.deletePattern('^vehicle-types:');
            cache_1.cacheService.deletePattern('^vehicle-type-stats:');
            return api_result_1.ApiResult.success(vehicleType, "Vehicle type updated successfully");
        }
        catch (error) {
            console.log("Error in updateVehicleType", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteVehicleType(id) {
        try {
            const existingVehicleType = await config_1.prisma.vehicle_types.findUnique({
                where: { id }
            });
            if (!existingVehicleType) {
                return api_result_1.ApiResult.error("Vehicle type not found", 404);
            }
            // Check if this vehicle type is being used by any vehicle names
            const vehicleNamesCount = await config_1.prisma.vehicle_names.count({
                where: { vehicleTypeId: id }
            });
            if (vehicleNamesCount > 0) {
                return api_result_1.ApiResult.error(`Cannot delete vehicle type. It is currently being used by ${vehicleNamesCount} vehicle name(s). Please remove or reassign these vehicle names first.`, 400);
            }
            // Note: Since the schema changed:
            // - Leads now use vehicleType enum (VehicleTypeEnum) which is independent of VehicleType table
            // - Orders use vehicleDetails JSON which doesn't reference VehicleType table
            // So we only need to check VehicleNames table for foreign key constraints
            await config_1.prisma.vehicle_types.delete({
                where: { id }
            });
            // Invalidate vehicle types cache and stats cache
            cache_1.cacheService.deletePattern('^vehicle-types:');
            cache_1.cacheService.deletePattern('^vehicle-type-stats:');
            return api_result_1.ApiResult.success(null, "Vehicle type deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteVehicleType", error);
            // Handle Prisma foreign key constraint errors
            if (error.code === 'P2003') {
                return api_result_1.ApiResult.error("Cannot delete vehicle type due to existing references. Please remove all associated records first.", 400);
            }
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getVehicleTypeStats(organizationId) {
        try {
            // Build cache key for stats
            const cacheKey = cache_1.cacheService.generateKey('vehicle-type-stats', { organizationId });
            // Try to get from cache
            const cachedResult = cache_1.cacheService.get(cacheKey);
            if (cachedResult) {
                return api_result_1.ApiResult.success(cachedResult, "Vehicle type statistics retrieved successfully (cached)");
            }
            const stats = await config_1.prisma.vehicle_types.groupBy({
                by: ['isActive'],
                where: { organizationId },
                _count: {
                    isActive: true
                }
            });
            const totalVehicleTypes = await config_1.prisma.vehicle_types.count({
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
                }
                else {
                    statsMap.inactive = stat._count.isActive;
                }
            });
            // Cache the result for 2 minutes
            cache_1.cacheService.set(cacheKey, statsMap, 2 * 60 * 1000);
            return api_result_1.ApiResult.success(statsMap, "Vehicle type statistics retrieved successfully");
        }
        catch (error) {
            console.log("Error in getVehicleTypeStats", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.VehicleTypeService = VehicleTypeService;
