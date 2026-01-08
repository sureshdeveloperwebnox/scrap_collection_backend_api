"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
class CrewService {
    async createCrew(data) {
        try {
            const { name, description, memberIds, organizationId } = data;
            // Check if crew name already exists in this organization
            const existing = await config_1.prisma.crews.findFirst({
                where: {
                    name,
                    organizationId
                }
            });
            if (existing) {
                return api_result_1.ApiResult.error('Crew with this name already exists in your organization', 400);
            }
            // Verify all members exist if provided
            if (memberIds && memberIds.length > 0) {
                const members = await config_1.prisma.employee.findMany({
                    where: {
                        id: { in: memberIds }
                    }
                });
                if (members.length !== memberIds.length) {
                    return api_result_1.ApiResult.error('One or more members not found', 400);
                }
            }
            const crew = await config_1.prisma.crews.create({
                data: {
                    updatedAt: new Date(),
                    name,
                    description,
                    organizationId,
                    Employee: {
                        connect: (memberIds === null || memberIds === void 0 ? void 0 : memberIds.map((id) => ({ id }))) || [],
                    },
                },
                include: {
                    Employee: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true,
                        }
                    },
                },
            });
            return api_result_1.ApiResult.success({ crew }, "Crew created successfully", 201);
        }
        catch (error) {
            console.error("Error in createCrew", error);
            return api_result_1.ApiResult.error(error.message || "Failed to create crew");
        }
    }
    async getAllCrews(organizationId) {
        try {
            const crews = await config_1.prisma.crews.findMany({
                where: {
                    isActive: true,
                    organizationId
                },
                include: {
                    Employee: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true,
                        }
                    },
                    _count: {
                        select: { Employee: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            return api_result_1.ApiResult.success({ crews }, "Crews fetched successfully");
        }
        catch (error) {
            console.error("Error in getAllCrews", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getCrewById(id) {
        try {
            const crew = await config_1.prisma.crews.findUnique({
                where: { id },
                include: {
                    Employee: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true,
                        }
                    },
                },
            });
            if (!crew) {
                return api_result_1.ApiResult.error('Crew not found', 404);
            }
            return api_result_1.ApiResult.success({ crew }, "Crew fetched successfully");
        }
        catch (error) {
            console.error("Error in getCrewById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateCrew(id, data) {
        try {
            const { memberIds, ...rest } = data;
            const updateData = { ...rest };
            if (memberIds) {
                // Replace members
                updateData.members = {
                    set: memberIds.map((mid) => ({ id: mid })),
                };
            }
            const crew = await config_1.prisma.crews.update({
                where: { id },
                data: updateData,
                include: {
                    Employee: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true,
                        }
                    },
                },
            });
            return api_result_1.ApiResult.success({ crew }, "Crew updated successfully");
        }
        catch (error) {
            console.error("Error in updateCrew", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteCrew(id) {
        try {
            await config_1.prisma.crews.update({
                where: { id },
                data: { updatedAt: new Date(), isActive: false },
            });
            return api_result_1.ApiResult.success(null, "Crew deleted successfully");
        }
        catch (error) {
            console.error("Error in deleteCrew", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.CrewService = CrewService;
