"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleTypeService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
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
            const existingVehicleType = await config_1.prisma.vehicleType.findFirst({
                where: {
                    name: data.name,
                    organizationId: data.organizationId || null
                }
            });
            if (existingVehicleType) {
                return api_result_1.ApiResult.error("Vehicle type with this name already exists for this organization", 400);
            }
            const vehicleType = await config_1.prisma.vehicleType.create({
                data: {
                    organizationId: data.organizationId,
                    name: data.name,
                    icon: data.icon,
                    isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true
                },
                include: {
                    organization: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            return api_result_1.ApiResult.success(vehicleType, "Vehicle type created successfully", 201);
        }
        catch (error) {
            console.log("Error in createVehicleType", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getVehicleTypes(query) {
        try {
            const { page = 1, limit = 10, search, isActive, organizationId } = query;
            // Coerce pagination to numbers
            const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const skip = (parsedPage - 1) * parsedLimit;
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
            const [vehicleTypes, total] = await Promise.all([
                config_1.prisma.vehicleType.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        organization: {
                            select: {
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                config_1.prisma.vehicleType.count({ where })
            ]);
            const totalPages = Math.ceil(total / parsedLimit);
            return api_result_1.ApiResult.success({
                vehicleTypes,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages
                }
            }, "Vehicle types retrieved successfully");
        }
        catch (error) {
            console.log("Error in getVehicleTypes", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getVehicleTypeById(id) {
        try {
            const vehicleType = await config_1.prisma.vehicleType.findUnique({
                where: { id },
                include: {
                    organization: {
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
            const existingVehicleType = await config_1.prisma.vehicleType.findUnique({
                where: { id }
            });
            if (!existingVehicleType) {
                return api_result_1.ApiResult.error("Vehicle type not found", 404);
            }
            // If name is being updated, check if it already exists for this organization
            if (data.name && data.name !== existingVehicleType.name) {
                const duplicateVehicleType = await config_1.prisma.vehicleType.findFirst({
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
            const vehicleType = await config_1.prisma.vehicleType.update({
                where: { id },
                data,
                include: {
                    organization: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            return api_result_1.ApiResult.success(vehicleType, "Vehicle type updated successfully");
        }
        catch (error) {
            console.log("Error in updateVehicleType", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteVehicleType(id) {
        try {
            const existingVehicleType = await config_1.prisma.vehicleType.findUnique({
                where: { id }
            });
            if (!existingVehicleType) {
                return api_result_1.ApiResult.error("Vehicle type not found", 404);
            }
            // Note: Since the schema changed:
            // - Leads now use vehicleType enum (VehicleTypeEnum) which is independent of VehicleType table
            // - Orders use vehicleDetails JSON which doesn't reference VehicleType table
            // So we can't check if a VehicleType is being used in leads or orders
            // VehicleType is now more of a master/reference table for UI purposes
            await config_1.prisma.vehicleType.delete({
                where: { id }
            });
            return api_result_1.ApiResult.success(null, "Vehicle type deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteVehicleType", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getVehicleTypeStats(organizationId) {
        try {
            const stats = await config_1.prisma.vehicleType.groupBy({
                by: ['isActive'],
                where: { organizationId },
                _count: {
                    isActive: true
                }
            });
            const totalVehicleTypes = await config_1.prisma.vehicleType.count({
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
            return api_result_1.ApiResult.success(statsMap, "Vehicle type statistics retrieved successfully");
        }
        catch (error) {
            console.log("Error in getVehicleTypeStats", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.VehicleTypeService = VehicleTypeService;
