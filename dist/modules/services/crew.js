"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
class CrewService {
    async createCrew(data) {
        try {
            const { name, description, memberIds } = data;
            // Check if crew name already exists
            const existing = await config_1.prisma.crew.findUnique({
                where: { name }
            });
            if (existing) {
                return api_result_1.ApiResult.error('Crew with this name already exists', 400);
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
            const crew = await config_1.prisma.crew.create({
                data: {
                    name,
                    description,
                    members: {
                        connect: (memberIds === null || memberIds === void 0 ? void 0 : memberIds.map((id) => ({ id }))) || [],
                    },
                },
                include: {
                    members: {
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
    async getAllCrews() {
        try {
            const crews = await config_1.prisma.crew.findMany({
                where: { isActive: true },
                include: {
                    members: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true,
                        }
                    },
                    _count: {
                        select: { members: true },
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
            const crew = await config_1.prisma.crew.findUnique({
                where: { id },
                include: {
                    members: {
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
            const crew = await config_1.prisma.crew.update({
                where: { id },
                data: updateData,
                include: {
                    members: {
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
            await config_1.prisma.crew.update({
                where: { id },
                data: { isActive: false },
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
