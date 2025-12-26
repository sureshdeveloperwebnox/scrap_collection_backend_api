import { IStartAssignmentRequest, ICompleteAssignmentRequest } from "../model/assignment.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { AssignmentStatus } from "../model/enum";
import { OrderStatus } from "../model/enum";

export class AssignmentService {
    /**
     * Start an assignment (for collector or crew)
     */
    public async startAssignment(data: IStartAssignmentRequest): Promise<ApiResult> {
        try {
            // Validate that either collectorId or crewId is provided
            if (!data.collectorId && !data.crewId) {
                return ApiResult.error('Either collectorId or crewId must be provided', 400);
            }

            // Verify the assignment exists
            const assignment = await prisma.assign_orders.findUnique({
                where: { id: data.assignOrderId },
                include: {
                    Order: true
                }
            });

            if (!assignment) {
                return ApiResult.error('Assignment not found', 404);
            }

            // Verify the assignment belongs to the order
            if (assignment.orderId !== data.orderId) {
                return ApiResult.error('Assignment does not belong to this order', 400);
            }

            // Verify the collector/crew is assigned to this assignment
            if (data.collectorId && assignment.collectorId !== data.collectorId) {
                return ApiResult.error('Collector not assigned to this assignment', 403);
            }

            if (data.crewId && assignment.crewId !== data.crewId) {
                return ApiResult.error('Crew not assigned to this assignment', 403);
            }

            // Check if already started
            if (assignment.status === AssignmentStatus.IN_PROGRESS) {
                return ApiResult.error('Assignment already in progress', 400);
            }

            if (assignment.status === AssignmentStatus.COMPLETED) {
                return ApiResult.error('Assignment already completed', 400);
            }

            // Update assignment status to IN_PROGRESS
            const updatedAssignment = await prisma.assign_orders.update({
                where: { id: data.assignOrderId },
                data: {
                    status: AssignmentStatus.IN_PROGRESS,
                    startTime: new Date()
                },
                include: {
                    Employee: true,
                    crews: {
                        include: {
                            Employee: true
                        }
                    },
                    Order: true
                }
            });

            // Update order status to IN_PROGRESS if it's not already
            if (assignment.Order.orderStatus !== OrderStatus.IN_PROGRESS) {
                await prisma.order.update({
                    where: { id: data.orderId },
                    data: {
                        orderStatus: OrderStatus.IN_PROGRESS
                    }
                });

                // Create timeline entry
                await prisma.order_timelines.create({
                    data: {
                        orderId: data.orderId,
                        status: OrderStatus.IN_PROGRESS,
                        notes: `Collection started by ${data.collectorId ? 'collector' : 'crew'}`,
                        performedBy: data.collectorId || data.crewId || 'system'
                    }
                });
            }

            // Transform response
            const transformedAssignment: any = {
                ...updatedAssignment,
                collector: updatedAssignment.Employee,
                crew: updatedAssignment.crews ? {
                    ...updatedAssignment.crews,
                    members: updatedAssignment.crews.Employee || []
                } : null
            };

            return ApiResult.success(transformedAssignment, "Assignment started successfully");
        } catch (error: any) {
            console.log("Error in startAssignment", error);
            return ApiResult.error(error.message || 'Failed to start assignment', 500);
        }
    }

    /**
     * Complete an assignment (for collector or crew)
     */
    public async completeAssignment(data: ICompleteAssignmentRequest): Promise<ApiResult> {
        try {
            // Validate that either collectorId or crewId is provided
            if (!data.collectorId && !data.crewId) {
                return ApiResult.error('Either collectorId or crewId must be provided', 400);
            }

            // Verify the assignment exists
            const assignment = await prisma.assign_orders.findUnique({
                where: { id: data.assignOrderId },
                include: {
                    Order: {
                        include: {
                            assign_orders: true
                        }
                    }
                }
            });

            if (!assignment) {
                return ApiResult.error('Assignment not found', 404);
            }

            // Verify the assignment belongs to the order
            if (assignment.orderId !== data.orderId) {
                return ApiResult.error('Assignment does not belong to this order', 400);
            }

            // Verify the collector/crew is assigned to this assignment
            if (data.collectorId && assignment.collectorId !== data.collectorId) {
                return ApiResult.error('Collector not assigned to this assignment', 403);
            }

            if (data.crewId && assignment.crewId !== data.crewId) {
                return ApiResult.error('Crew not assigned to this assignment', 403);
            }

            // Check if already completed
            if (assignment.status === AssignmentStatus.COMPLETED) {
                return ApiResult.error('Assignment already completed', 400);
            }

            // Update assignment status to COMPLETED
            const updatedAssignment = await prisma.assign_orders.update({
                where: { id: data.assignOrderId },
                data: {
                    status: AssignmentStatus.COMPLETED,
                    endTime: new Date(),
                    completedAt: new Date(),
                    completionNotes: data.completionNotes,
                    completionPhotos: data.completionPhotos || []
                },
                include: {
                    Employee: true,
                    crews: {
                        include: {
                            Employee: true
                        }
                    },
                    Order: true
                }
            });

            // Check if all assignments for this order are completed
            const allAssignments = assignment.Order.assign_orders;
            const allCompleted = allAssignments.every(a =>
                a.id === data.assignOrderId || a.status === AssignmentStatus.COMPLETED
            );

            // If all assignments are completed, update order status to COMPLETED
            if (allCompleted) {
                await prisma.order.update({
                    where: { id: data.orderId },
                    data: {
                        orderStatus: OrderStatus.COMPLETED
                    }
                });

                // Create timeline entry
                await prisma.order_timelines.create({
                    data: {
                        orderId: data.orderId,
                        status: OrderStatus.COMPLETED,
                        notes: `All assignments completed. Order completed by ${data.collectorId ? 'collector' : 'crew'}`,
                        performedBy: data.collectorId || data.crewId || 'system'
                    }
                });
            } else {
                // Create timeline entry for this assignment completion
                await prisma.order_timelines.create({
                    data: {
                        orderId: data.orderId,
                        status: OrderStatus.IN_PROGRESS,
                        notes: `Assignment completed by ${data.collectorId ? 'collector' : 'crew'}. ${data.completionNotes || ''}`,
                        performedBy: data.collectorId || data.crewId || 'system'
                    }
                });
            }

            // Transform response
            const transformedAssignment: any = {
                ...updatedAssignment,
                collector: updatedAssignment.Employee,
                crew: updatedAssignment.crews ? {
                    ...updatedAssignment.crews,
                    members: updatedAssignment.crews.Employee || []
                } : null
            };

            return ApiResult.success(transformedAssignment, "Assignment completed successfully");
        } catch (error: any) {
            console.log("Error in completeAssignment", error);
            return ApiResult.error(error.message || 'Failed to complete assignment', 500);
        }
    }

    /**
     * Get assignment details by ID
     */
    public async getAssignmentById(assignOrderId: string): Promise<ApiResult> {
        try {
            const assignment = await prisma.assign_orders.findUnique({
                where: { id: assignOrderId },
                include: {
                    Employee: true,
                    crews: {
                        include: {
                            Employee: true
                        }
                    },
                    Order: {
                        include: {
                            Customer: true,
                            scrap_yards: true
                        }
                    }
                }
            });

            if (!assignment) {
                return ApiResult.error('Assignment not found', 404);
            }

            // Transform response
            const transformedAssignment: any = {
                ...assignment,
                collector: assignment.Employee,
                crew: assignment.crews ? {
                    ...assignment.crews,
                    members: assignment.crews.Employee || []
                } : null,
                order: {
                    ...assignment.Order,
                    yard: assignment.Order.scrap_yards
                }
            };

            return ApiResult.success(transformedAssignment, "Assignment retrieved successfully");
        } catch (error: any) {
            console.log("Error in getAssignmentById", error);
            return ApiResult.error(error.message || 'Failed to get assignment', 500);
        }
    }

    /**
     * Get all assignments for a collector
     */
    public async getCollectorAssignments(collectorId: string, status?: AssignmentStatus): Promise<ApiResult> {
        try {
            const where: any = {
                collectorId: collectorId
            };

            if (status) {
                where.status = status;
            }

            const assignments = await prisma.assign_orders.findMany({
                where,
                include: {
                    Employee: true,
                    Order: {
                        include: {
                            Customer: true,
                            scrap_yards: true
                        }
                    }
                },
                orderBy: {
                    assignedAt: 'desc'
                }
            });

            // Transform response
            const transformedAssignments = assignments.map((assignment: any) => ({
                ...assignment,
                collector: assignment.Employee,
                order: {
                    ...assignment.Order,
                    yard: assignment.Order.scrap_yards
                }
            }));

            return ApiResult.success(transformedAssignments, "Collector assignments retrieved successfully");
        } catch (error: any) {
            console.log("Error in getCollectorAssignments", error);
            return ApiResult.error(error.message || 'Failed to get collector assignments', 500);
        }
    }

    /**
     * Get all assignments for a crew
     */
    public async getCrewAssignments(crewId: string, status?: AssignmentStatus): Promise<ApiResult> {
        try {
            const where: any = {
                crewId: crewId
            };

            if (status) {
                where.status = status;
            }

            const assignments = await prisma.assign_orders.findMany({
                where,
                include: {
                    crews: {
                        include: {
                            Employee: true
                        }
                    },
                    Order: {
                        include: {
                            Customer: true,
                            scrap_yards: true
                        }
                    }
                },
                orderBy: {
                    assignedAt: 'desc'
                }
            });

            // Transform response
            const transformedAssignments = assignments.map((assignment: any) => ({
                ...assignment,
                crew: assignment.crews ? {
                    ...assignment.crews,
                    members: assignment.crews.Employee || []
                } : null,
                order: {
                    ...assignment.Order,
                    yard: assignment.Order.scrap_yards
                }
            }));

            return ApiResult.success(transformedAssignments, "Crew assignments retrieved successfully");
        } catch (error: any) {
            console.log("Error in getCrewAssignments", error);
            return ApiResult.error(error.message || 'Failed to get crew assignments', 500);
        }
    }
}
