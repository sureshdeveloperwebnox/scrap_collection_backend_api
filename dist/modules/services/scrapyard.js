"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapYardService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
class ScrapYardService {
    async createScrapYard(data) {
        try {
            const scrapYard = await config_1.prisma.scrapYard.create({
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
                    organization: true,
                    employees: true
                }
            });
            return api_result_1.ApiResult.success(scrapYard, "Scrap yard created successfully", 201);
        }
        catch (error) {
            console.log("Error in createScrapYard", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getScrapYards(query) {
        try {
            const { page = 1, limit = 10, search, organizationId, status } = query;
            const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const skip = (parsedPage - 1) * parsedLimit;
            const where = {};
            if (organizationId) {
                where.organizationId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
            }
            // Add status filter
            if (status !== undefined && status !== null && status !== '') {
                // Convert string 'true'/'false' to boolean
                if (status === 'true' || status === true) {
                    where.isActive = true;
                }
                else if (status === 'false' || status === false) {
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
                config_1.prisma.scrapYard.findMany({
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
                config_1.prisma.scrapYard.count({ where })
            ]);
            // Fetch assigned employees (managers) based on assignedEmployeeIds
            const scrapYardsWithEmployees = await Promise.all(scrapYards.map(async (yard) => {
                let assignedEmployees = [];
                // Parse assignedEmployeeIds from JSON
                if (yard.assignedEmployeeIds) {
                    try {
                        const employeeIds = Array.isArray(yard.assignedEmployeeIds)
                            ? yard.assignedEmployeeIds
                            : JSON.parse(yard.assignedEmployeeIds);
                        if (Array.isArray(employeeIds) && employeeIds.length > 0) {
                            // Fetch employees by their IDs
                            assignedEmployees = await config_1.prisma.employee.findMany({
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
                    }
                    catch (error) {
                        console.error('Error parsing assignedEmployeeIds:', error);
                    }
                }
                return {
                    ...yard,
                    employees: assignedEmployees,
                    managerId: yard.managerId
                };
            }));
            return api_result_1.ApiResult.success({
                scrapYards: scrapYardsWithEmployees,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(total / parsedLimit)
                }
            }, "Scrap yards retrieved successfully");
        }
        catch (error) {
            console.log("Error in getScrapYards", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getScrapYardById(id) {
        try {
            const scrapYard = await config_1.prisma.scrapYard.findUnique({
                where: { id },
                include: {
                    organization: true,
                    employees: true,
                    orders: true
                }
            });
            if (!scrapYard) {
                return api_result_1.ApiResult.error("Scrap yard not found", 404);
            }
            // Fetch assigned employees (managers) based on assignedEmployeeIds
            let assignedEmployees = [];
            if (scrapYard.assignedEmployeeIds) {
                try {
                    const employeeIds = Array.isArray(scrapYard.assignedEmployeeIds)
                        ? scrapYard.assignedEmployeeIds
                        : JSON.parse(scrapYard.assignedEmployeeIds);
                    if (Array.isArray(employeeIds) && employeeIds.length > 0) {
                        assignedEmployees = await config_1.prisma.employee.findMany({
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
                }
                catch (error) {
                    console.error('Error parsing assignedEmployeeIds:', error);
                }
            }
            const scrapYardWithEmployees = {
                ...scrapYard,
                employees: assignedEmployees,
                managerId: scrapYard.managerId
            };
            return api_result_1.ApiResult.success(scrapYardWithEmployees, "Scrap yard retrieved successfully");
        }
        catch (error) {
            console.log("Error in getScrapYardById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateScrapYard(id, data) {
        try {
            const scrapYard = await config_1.prisma.scrapYard.update({
                where: { id },
                data,
                include: {
                    organization: true,
                    employees: true
                }
            });
            return api_result_1.ApiResult.success(scrapYard, "Scrap yard updated successfully");
        }
        catch (error) {
            console.log("Error in updateScrapYard", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteScrapYard(id) {
        try {
            await config_1.prisma.scrapYard.delete({
                where: { id }
            });
            return api_result_1.ApiResult.success(null, "Scrap yard deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteScrapYard", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getScrapYardStats(query) {
        try {
            const { organizationId } = query;
            const where = {};
            if (organizationId) {
                where.organizationId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
            }
            const stats = await config_1.prisma.scrapYard.groupBy({
                by: ['isActive'],
                where,
                _count: {
                    isActive: true
                }
            });
            const totalValue = await config_1.prisma.scrapYard.count({ where });
            const statsMap = {
                total: totalValue,
                active: 0,
                inactive: 0,
                maintenance: 0,
                byState: {}
            };
            stats.forEach(stat => {
                if (stat.isActive) {
                    statsMap.active = stat._count.isActive;
                }
                else {
                    statsMap.inactive = stat._count.isActive;
                }
            });
            return api_result_1.ApiResult.success(statsMap, "Scrap yard statistics retrieved successfully");
        }
        catch (error) {
            console.log("Error in getScrapYardStats", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.ScrapYardService = ScrapYardService;
