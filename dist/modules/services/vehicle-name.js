"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleNameService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const cache_1 = require("../../utils/cache");
class VehicleNameService {
    async createVehicleName(data) {
        var _a;
        try {
            // Check if organization exists
            const organization = await config_1.prisma.organization.findUnique({
                where: { id: data.organizationId }
            });
            if (!organization) {
                return api_result_1.ApiResult.error("Organization not found", 404);
            }
            // Check if vehicle type exists
            const vehicleType = await config_1.prisma.vehicleType.findUnique({
                where: { id: data.vehicleTypeId }
            });
            if (!vehicleType) {
                return api_result_1.ApiResult.error("Vehicle type not found", 404);
            }
            // Check if scrap yard exists (if provided)
            if (data.scrapYardId) {
                const scrapYard = await config_1.prisma.scrapYard.findUnique({
                    where: { id: data.scrapYardId }
                });
                if (!scrapYard) {
                    return api_result_1.ApiResult.error("Scrap yard not found", 404);
                }
            }
            // Check if vehicle name already exists for this combination
            const existingVehicleName = await config_1.prisma.vehicleName.findFirst({
                where: {
                    name: data.name,
                    vehicleTypeId: data.vehicleTypeId,
                    organizationId: data.organizationId
                }
            });
            if (existingVehicleName) {
                return api_result_1.ApiResult.error("Vehicle name already exists in this organization", 400);
            }
            const vehicleName = await config_1.prisma.vehicleName.create({
                data: {
                    organizationId: data.organizationId,
                    name: data.name,
                    vehicleTypeId: data.vehicleTypeId,
                    scrapYardId: data.scrapYardId,
                    isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true,
                    vehicleNumber: data.vehicleNumber,
                    make: data.make,
                    model: data.model,
                    year: data.year
                },
                include: {
                    vehicleType: {
                        select: {
                            id: true,
                            name: true,
                            icon: true
                        }
                    },
                    scrapYard: {
                        select: {
                            id: true,
                            yardName: true,
                            address: true
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
            cache_1.cacheService.deletePattern('^vehicle-names:');
            return api_result_1.ApiResult.success(vehicleName, "Vehicle name created successfully", 201);
        }
        catch (error) {
            console.log("Error in createVehicleName", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getVehicleNames(query) {
        try {
            const { page = 1, limit = 10, search, isActive, organizationId, vehicleTypeId, scrapYardId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
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
            const cacheKey = cache_1.cacheService.generateKey('vehicle-names', {
                page: parsedPage,
                limit: parsedLimit,
                search,
                isActive,
                organizationId,
                vehicleTypeId,
                scrapYardId,
                sortBy,
                sortOrder
            });
            // Try to get from cache
            const cachedResult = cache_1.cacheService.get(cacheKey);
            if (cachedResult) {
                return api_result_1.ApiResult.success(cachedResult, "Vehicle names retrieved successfully (cached)");
            }
            const where = {};
            if (organizationId !== undefined && organizationId !== null && organizationId !== '') {
                const parsedOrgId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : Number(organizationId);
                if (!Number.isNaN(parsedOrgId)) {
                    where.organizationId = parsedOrgId;
                }
            }
            if (vehicleTypeId !== undefined && vehicleTypeId !== null && vehicleTypeId !== '') {
                const parsedVehicleTypeId = typeof vehicleTypeId === 'string' ? parseInt(vehicleTypeId, 10) : Number(vehicleTypeId);
                if (!Number.isNaN(parsedVehicleTypeId)) {
                    where.vehicleTypeId = parsedVehicleTypeId;
                }
            }
            if (scrapYardId !== undefined && scrapYardId !== null && scrapYardId !== '') {
                where.scrapYardId = scrapYardId;
            }
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
                    { vehicleType: { name: { contains: search, mode: 'insensitive' } } },
                    { scrapYard: { yardName: { contains: search, mode: 'insensitive' } } }
                ];
            }
            // Validate sort fields
            const validSortFields = ['name', 'isActive', 'createdAt', 'updatedAt'];
            const validSortOrder = ['asc', 'desc'];
            const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
            const finalSortOrder = validSortOrder.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';
            const orderBy = {};
            orderBy[finalSortBy] = finalSortOrder;
            const [vehicleNames, total] = await Promise.all([
                config_1.prisma.vehicleName.findMany({
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
                        scrapYard: {
                            select: {
                                id: true,
                                yardName: true,
                                address: true
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
                config_1.prisma.vehicleName.count({ where })
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
            cache_1.cacheService.set(cacheKey, result, 3 * 60 * 1000);
            return api_result_1.ApiResult.success(result, "Vehicle names retrieved successfully");
        }
        catch (error) {
            console.log("Error in getVehicleNames", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getVehicleNameById(id) {
        try {
            const vehicleName = await config_1.prisma.vehicleName.findUnique({
                where: { id },
                include: {
                    vehicleType: {
                        select: {
                            id: true,
                            name: true,
                            icon: true
                        }
                    },
                    scrapYard: {
                        select: {
                            id: true,
                            yardName: true,
                            address: true
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
                return api_result_1.ApiResult.error("Vehicle name not found", 404);
            }
            return api_result_1.ApiResult.success(vehicleName, "Vehicle name retrieved successfully");
        }
        catch (error) {
            console.log("Error in getVehicleNameById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateVehicleName(id, data) {
        var _a, _b;
        try {
            const existingVehicleName = await config_1.prisma.vehicleName.findUnique({
                where: { id }
            });
            if (!existingVehicleName) {
                return api_result_1.ApiResult.error("Vehicle name not found", 404);
            }
            // Check if vehicle type exists (if being updated)
            if (data.vehicleTypeId) {
                const vehicleType = await config_1.prisma.vehicleType.findUnique({
                    where: { id: data.vehicleTypeId }
                });
                if (!vehicleType) {
                    return api_result_1.ApiResult.error("Vehicle type not found", 404);
                }
            }
            // Check if scrap yard exists (if being updated)
            if (data.scrapYardId) {
                const scrapYard = await config_1.prisma.scrapYard.findUnique({
                    where: { id: data.scrapYardId }
                });
                if (!scrapYard) {
                    return api_result_1.ApiResult.error("Scrap yard not found", 404);
                }
            }
            // If name or vehicleTypeId is being updated, check for duplicates
            const finalVehicleTypeId = (_a = data.vehicleTypeId) !== null && _a !== void 0 ? _a : existingVehicleName.vehicleTypeId;
            const finalName = (_b = data.name) !== null && _b !== void 0 ? _b : existingVehicleName.name;
            if (data.name || data.vehicleTypeId) {
                const duplicateVehicleName = await config_1.prisma.vehicleName.findFirst({
                    where: {
                        name: finalName,
                        vehicleTypeId: finalVehicleTypeId,
                        organizationId: existingVehicleName.organizationId,
                        id: { not: id }
                    }
                });
                if (duplicateVehicleName) {
                    return api_result_1.ApiResult.error("Vehicle name already exists in this organization", 400);
                }
            }
            const vehicleName = await config_1.prisma.vehicleName.update({
                where: { id },
                data: {
                    name: data.name,
                    vehicleTypeId: data.vehicleTypeId,
                    scrapYardId: data.scrapYardId,
                    isActive: data.isActive,
                    vehicleNumber: data.vehicleNumber,
                    make: data.make,
                    model: data.model,
                    year: data.year
                },
                include: {
                    vehicleType: {
                        select: {
                            id: true,
                            name: true,
                            icon: true
                        }
                    },
                    scrapYard: {
                        select: {
                            id: true,
                            yardName: true,
                            address: true
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
            cache_1.cacheService.deletePattern('^vehicle-names:');
            return api_result_1.ApiResult.success(vehicleName, "Vehicle name updated successfully");
        }
        catch (error) {
            console.log("Error in updateVehicleName", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteVehicleName(id) {
        try {
            const existingVehicleName = await config_1.prisma.vehicleName.findUnique({
                where: { id },
                include: {
                    collectorAssignments: {
                        take: 1
                    }
                }
            });
            if (!existingVehicleName) {
                return api_result_1.ApiResult.error("Vehicle name not found", 404);
            }
            // Check if vehicle name is being used in collector assignments
            if (existingVehicleName.collectorAssignments.length > 0) {
                return api_result_1.ApiResult.error("Cannot delete vehicle name as it is assigned to collectors", 400);
            }
            await config_1.prisma.vehicleName.delete({
                where: { id }
            });
            // Invalidate vehicle names cache
            cache_1.cacheService.deletePattern('^vehicle-names:');
            return api_result_1.ApiResult.success(null, "Vehicle name deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteVehicleName", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getVehicleNameStats(organizationId) {
        var _a, _b;
        try {
            const stats = await config_1.prisma.vehicleName.groupBy({
                by: ['isActive'],
                where: {
                    organizationId
                },
                _count: {
                    isActive: true
                }
            });
            const total = stats.reduce((acc, curr) => acc + curr._count.isActive, 0);
            const active = ((_a = stats.find(s => s.isActive)) === null || _a === void 0 ? void 0 : _a._count.isActive) || 0;
            const inactive = ((_b = stats.find(s => !s.isActive)) === null || _b === void 0 ? void 0 : _b._count.isActive) || 0;
            return api_result_1.ApiResult.success({
                total,
                active,
                inactive
            }, "Vehicle name stats retrieved successfully");
        }
        catch (error) {
            console.log("Error in getVehicleNameStats", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.VehicleNameService = VehicleNameService;
