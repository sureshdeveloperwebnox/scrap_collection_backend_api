"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectorAssignmentService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const cache_1 = require("../../utils/cache");
class CollectorAssignmentService {
    async createCollectorAssignment(data) {
        var _a;
        try {
            // Check if organization exists
            const organization = await config_1.prisma.organization.findUnique({
                where: { id: data.organizationId }
            });
            if (!organization) {
                return api_result_1.ApiResult.error("Organization not found", 404);
            }
            // Check if collector exists
            const collector = await config_1.prisma.employee.findUnique({
                where: { id: data.collectorId }
            });
            if (!collector) {
                return api_result_1.ApiResult.error("Collector not found", 404);
            }
            // Check if collector belongs to the organization
            if (collector.organizationId !== data.organizationId) {
                return api_result_1.ApiResult.error("Collector does not belong to this organization", 403);
            }
            // Check if vehicle name exists (if provided)
            if (data.vehicleNameId) {
                const vehicleName = await config_1.prisma.vehicleName.findUnique({
                    where: { id: data.vehicleNameId }
                });
                if (!vehicleName) {
                    return api_result_1.ApiResult.error("Vehicle name not found", 404);
                }
                if (vehicleName.organizationId !== data.organizationId) {
                    return api_result_1.ApiResult.error("Vehicle name does not belong to this organization", 403);
                }
            }
            // Check if city exists (if provided)
            if (data.cityId) {
                const city = await config_1.prisma.city.findUnique({
                    where: { id: data.cityId }
                });
                if (!city) {
                    return api_result_1.ApiResult.error("City not found", 404);
                }
            }
            // Check if at least one assignment is provided
            if (!data.vehicleNameId && !data.cityId) {
                return api_result_1.ApiResult.error("Either vehicleNameId or cityId must be provided", 400);
            }
            // Check if assignment already exists
            const existingAssignment = await config_1.prisma.collectorAssignment.findFirst({
                where: {
                    collectorId: data.collectorId,
                    vehicleNameId: data.vehicleNameId || null,
                    cityId: data.cityId || null,
                    organizationId: data.organizationId
                }
            });
            if (existingAssignment) {
                return api_result_1.ApiResult.error("This assignment already exists", 400);
            }
            const assignment = await config_1.prisma.collectorAssignment.create({
                data: {
                    organizationId: data.organizationId,
                    collectorId: data.collectorId,
                    vehicleNameId: data.vehicleNameId || null,
                    cityId: data.cityId || null,
                    isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true
                },
                include: {
                    collector: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true
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
            cache_1.cacheService.deletePattern('^collector-assignments:');
            return api_result_1.ApiResult.success(assignment, "Collector assignment created successfully", 201);
        }
        catch (error) {
            console.log("Error in createCollectorAssignment", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getCollectorAssignments(query) {
        try {
            const { page = 1, limit = 10, search, isActive, organizationId, collectorId, vehicleNameId, cityId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
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
            const cacheKey = cache_1.cacheService.generateKey('collector-assignments', {
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
            const cachedResult = cache_1.cacheService.get(cacheKey);
            if (cachedResult) {
                return api_result_1.ApiResult.success(cachedResult, "Collector assignments retrieved successfully (cached)");
            }
            const where = {};
            if (organizationId !== undefined && organizationId !== null && organizationId !== '') {
                const parsedOrgId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : Number(organizationId);
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
                const parsedCityId = typeof cityId === 'string' ? parseInt(cityId, 10) : Number(cityId);
                if (!Number.isNaN(parsedCityId)) {
                    where.cityId = parsedCityId;
                }
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
            const orderBy = {};
            orderBy[finalSortBy] = finalSortOrder;
            const [assignments, total] = await Promise.all([
                config_1.prisma.collectorAssignment.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        collector: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true
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
                config_1.prisma.collectorAssignment.count({ where })
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
            cache_1.cacheService.set(cacheKey, result, 3 * 60 * 1000);
            return api_result_1.ApiResult.success(result, "Collector assignments retrieved successfully");
        }
        catch (error) {
            console.log("Error in getCollectorAssignments", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getCollectorAssignmentById(id) {
        try {
            const assignment = await config_1.prisma.collectorAssignment.findUnique({
                where: { id },
                include: {
                    collector: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true
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
                return api_result_1.ApiResult.error("Collector assignment not found", 404);
            }
            return api_result_1.ApiResult.success(assignment, "Collector assignment retrieved successfully");
        }
        catch (error) {
            console.log("Error in getCollectorAssignmentById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateCollectorAssignment(id, data) {
        try {
            const existingAssignment = await config_1.prisma.collectorAssignment.findUnique({
                where: { id }
            });
            if (!existingAssignment) {
                return api_result_1.ApiResult.error("Collector assignment not found", 404);
            }
            // Check if vehicle name exists (if being updated)
            if (data.vehicleNameId !== undefined && data.vehicleNameId !== null) {
                const vehicleName = await config_1.prisma.vehicleName.findUnique({
                    where: { id: data.vehicleNameId }
                });
                if (!vehicleName) {
                    return api_result_1.ApiResult.error("Vehicle name not found", 404);
                }
                if (vehicleName.organizationId !== existingAssignment.organizationId) {
                    return api_result_1.ApiResult.error("Vehicle name does not belong to this organization", 403);
                }
            }
            // Check if city exists (if being updated)
            if (data.cityId !== undefined && data.cityId !== null) {
                const city = await config_1.prisma.city.findUnique({
                    where: { id: data.cityId }
                });
                if (!city) {
                    return api_result_1.ApiResult.error("City not found", 404);
                }
            }
            // Ensure at least one assignment remains
            const finalVehicleNameId = data.vehicleNameId !== undefined ? data.vehicleNameId : existingAssignment.vehicleNameId;
            const finalCityId = data.cityId !== undefined ? data.cityId : existingAssignment.cityId;
            if (!finalVehicleNameId && !finalCityId) {
                return api_result_1.ApiResult.error("Either vehicleNameId or cityId must be provided", 400);
            }
            // Check for duplicate assignment
            if (data.vehicleNameId !== undefined || data.cityId !== undefined) {
                const duplicateAssignment = await config_1.prisma.collectorAssignment.findFirst({
                    where: {
                        collectorId: existingAssignment.collectorId,
                        vehicleNameId: finalVehicleNameId || null,
                        cityId: finalCityId || null,
                        organizationId: existingAssignment.organizationId,
                        id: { not: id }
                    }
                });
                if (duplicateAssignment) {
                    return api_result_1.ApiResult.error("This assignment already exists", 400);
                }
            }
            const assignment = await config_1.prisma.collectorAssignment.update({
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
                            phone: true
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
            cache_1.cacheService.deletePattern('^collector-assignments:');
            return api_result_1.ApiResult.success(assignment, "Collector assignment updated successfully");
        }
        catch (error) {
            console.log("Error in updateCollectorAssignment", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteCollectorAssignment(id) {
        try {
            const existingAssignment = await config_1.prisma.collectorAssignment.findUnique({
                where: { id }
            });
            if (!existingAssignment) {
                return api_result_1.ApiResult.error("Collector assignment not found", 404);
            }
            await config_1.prisma.collectorAssignment.delete({
                where: { id }
            });
            // Invalidate collector assignments cache
            cache_1.cacheService.deletePattern('^collector-assignments:');
            return api_result_1.ApiResult.success(null, "Collector assignment deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteCollectorAssignment", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.CollectorAssignmentService = CollectorAssignmentService;
