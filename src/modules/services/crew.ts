
import { CreateCrewDto, UpdateCrewDto } from '../model/crew.interface';
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";

export class CrewService {
    public async createCrew(data: CreateCrewDto): Promise<ApiResult> {
        try {
            const { name, description, memberIds } = data;

            // Check if crew name already exists
            const existing = await prisma.crews.findUnique({
                where: { name }
            });

            if (existing) {
                return ApiResult.error('Crew with this name already exists', 400);
            }

            // Verify all members exist if provided
            if (memberIds && memberIds.length > 0) {
                const members = await prisma.employee.findMany({
                    where: {
                        id: { in: memberIds }
                    }
                });

                if (members.length !== memberIds.length) {
                    return ApiResult.error('One or more members not found', 400);
                }
            }

            const crew = await prisma.crews.create({
                data: { updatedAt: new Date(), 
                    name,
                    description,
                    Employee: {
                        connect: memberIds?.map((id) => ({ id })) || [],
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

            return ApiResult.success({ crew }, "Crew created successfully", 201);
        } catch (error: any) {
            console.error("Error in createCrew", error);
            return ApiResult.error(error.message || "Failed to create crew");
        }
    }

    public async getAllCrews(): Promise<ApiResult> {
        try {
            const crews = await prisma.crews.findMany({
                where: { isActive: true },
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

            return ApiResult.success({ crews }, "Crews fetched successfully");
        } catch (error: any) {
            console.error("Error in getAllCrews", error);
            return ApiResult.error(error.message);
        }
    }

    public async getCrewById(id: string): Promise<ApiResult> {
        try {
            const crew = await prisma.crews.findUnique({
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
                return ApiResult.error('Crew not found', 404);
            }

            return ApiResult.success({ crew }, "Crew fetched successfully");
        } catch (error: any) {
            console.error("Error in getCrewById", error);
            return ApiResult.error(error.message);
        }
    }

    public async updateCrew(id: string, data: UpdateCrewDto): Promise<ApiResult> {
        try {
            const { memberIds, ...rest } = data;

            const updateData: any = { ...rest };

            if (memberIds) {
                // Replace members
                updateData.members = {
                    set: memberIds.map((mid: string) => ({ id: mid })),
                };
            }

            const crew = await prisma.crews.update({
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

            return ApiResult.success({ crew }, "Crew updated successfully");
        } catch (error: any) {
            console.error("Error in updateCrew", error);
            return ApiResult.error(error.message);
        }
    }

    public async deleteCrew(id: string): Promise<ApiResult> {
        try {
            await prisma.crews.update({
                where: { id },
                data: { updatedAt: new Date(),  isActive: false },
            });
            return ApiResult.success(null, "Crew deleted successfully");
        } catch (error: any) {
            console.error("Error in deleteCrew", error);
            return ApiResult.error(error.message);
        }
    }
}
