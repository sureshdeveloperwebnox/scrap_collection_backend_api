"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const enum_1 = require("../model/enum");
const enum_2 = require("../model/enum");
class AssignmentService {
    /**
     * Start an assignment (for collector or crew)
     */
    async startAssignment(data) {
        try {
            // Validate that either collectorId or crewId is provided
            if (!data.collectorId && !data.crewId) {
                return api_result_1.ApiResult.error('Either collectorId or crewId must be provided', 400);
            }
            // Verify the assignment exists
            const assignment = await config_1.prisma.assign_orders.findUnique({
                where: { id: data.assignOrderId },
                include: {
                    Order: true
                }
            });
            if (!assignment) {
                return api_result_1.ApiResult.error('Assignment not found', 404);
            }
            // Verify the assignment belongs to the order
            if (assignment.orderId !== data.orderId) {
                return api_result_1.ApiResult.error('Assignment does not belong to this order', 400);
            }
            // Verify the collector/crew is assigned to this assignment
            if (data.collectorId && assignment.collectorId !== data.collectorId) {
                return api_result_1.ApiResult.error('Collector not assigned to this assignment', 403);
            }
            if (data.crewId && assignment.crewId !== data.crewId) {
                return api_result_1.ApiResult.error('Crew not assigned to this assignment', 403);
            }
            // Check if already started
            if (assignment.status === enum_1.AssignmentStatus.IN_PROGRESS) {
                return api_result_1.ApiResult.error('Assignment already in progress', 400);
            }
            if (assignment.status === enum_1.AssignmentStatus.COMPLETED) {
                return api_result_1.ApiResult.error('Assignment already completed', 400);
            }
            // Update assignment status to IN_PROGRESS
            const updatedAssignment = await config_1.prisma.assign_orders.update({
                where: { id: data.assignOrderId },
                data: {
                    status: enum_1.AssignmentStatus.IN_PROGRESS,
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
            if (assignment.Order.orderStatus !== enum_2.OrderStatus.IN_PROGRESS) {
                await config_1.prisma.order.update({
                    where: { id: data.orderId },
                    data: {
                        orderStatus: enum_2.OrderStatus.IN_PROGRESS
                    }
                });
                // Create timeline entry
                await config_1.prisma.order_timelines.create({
                    data: {
                        orderId: data.orderId,
                        status: enum_2.OrderStatus.IN_PROGRESS,
                        notes: `Collection started by ${data.collectorId ? 'collector' : 'crew'}`,
                        performedBy: data.collectorId || data.crewId || 'system'
                    }
                });
            }
            // Transform response
            const transformedAssignment = {
                ...updatedAssignment,
                collector: updatedAssignment.Employee,
                crew: updatedAssignment.crews ? {
                    ...updatedAssignment.crews,
                    members: updatedAssignment.crews.Employee || []
                } : null
            };
            return api_result_1.ApiResult.success(transformedAssignment, "Assignment started successfully");
        }
        catch (error) {
            console.log("Error in startAssignment", error);
            return api_result_1.ApiResult.error(error.message || 'Failed to start assignment', 500);
        }
    }
    /**
     * Complete an assignment (for collector or crew)
     */
    async completeAssignment(data) {
        try {
            // Validate that either collectorId or crewId is provided
            if (!data.collectorId && !data.crewId) {
                return api_result_1.ApiResult.error('Either collectorId or crewId must be provided', 400);
            }
            // Verify the assignment exists
            const assignment = await config_1.prisma.assign_orders.findUnique({
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
                return api_result_1.ApiResult.error('Assignment not found', 404);
            }
            // Verify the assignment belongs to the order
            if (assignment.orderId !== data.orderId) {
                return api_result_1.ApiResult.error('Assignment does not belong to this order', 400);
            }
            // Verify the collector/crew is assigned to this assignment
            if (data.collectorId && assignment.collectorId !== data.collectorId) {
                return api_result_1.ApiResult.error('Collector not assigned to this assignment', 403);
            }
            if (data.crewId && assignment.crewId !== data.crewId) {
                return api_result_1.ApiResult.error('Crew not assigned to this assignment', 403);
            }
            // Check if already completed
            if (assignment.status === enum_1.AssignmentStatus.COMPLETED) {
                return api_result_1.ApiResult.error('Assignment already completed', 400);
            }
            // Update assignment status to COMPLETED
            const updatedAssignment = await config_1.prisma.assign_orders.update({
                where: { id: data.assignOrderId },
                data: {
                    status: enum_1.AssignmentStatus.COMPLETED,
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
            const allCompleted = allAssignments.every(a => a.id === data.assignOrderId || a.status === enum_1.AssignmentStatus.COMPLETED);
            // If all assignments are completed, update order status to COMPLETED
            if (allCompleted) {
                await config_1.prisma.order.update({
                    where: { id: data.orderId },
                    data: {
                        orderStatus: enum_2.OrderStatus.COMPLETED
                    }
                });
                // Create timeline entry
                await config_1.prisma.order_timelines.create({
                    data: {
                        orderId: data.orderId,
                        status: enum_2.OrderStatus.COMPLETED,
                        notes: `All assignments completed. Order completed by ${data.collectorId ? 'collector' : 'crew'}`,
                        performedBy: data.collectorId || data.crewId || 'system'
                    }
                });
            }
            else {
                // Create timeline entry for this assignment completion
                await config_1.prisma.order_timelines.create({
                    data: {
                        orderId: data.orderId,
                        status: enum_2.OrderStatus.IN_PROGRESS,
                        notes: `Assignment completed by ${data.collectorId ? 'collector' : 'crew'}. ${data.completionNotes || ''}`,
                        performedBy: data.collectorId || data.crewId || 'system'
                    }
                });
            }
            // Transform response
            const transformedAssignment = {
                ...updatedAssignment,
                collector: updatedAssignment.Employee,
                crew: updatedAssignment.crews ? {
                    ...updatedAssignment.crews,
                    members: updatedAssignment.crews.Employee || []
                } : null
            };
            return api_result_1.ApiResult.success(transformedAssignment, "Assignment completed successfully");
        }
        catch (error) {
            console.log("Error in completeAssignment", error);
            return api_result_1.ApiResult.error(error.message || 'Failed to complete assignment', 500);
        }
    }
    /**
     * Get assignment details by ID
     */
    async getAssignmentById(assignOrderId) {
        try {
            const assignment = await config_1.prisma.assign_orders.findUnique({
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
                return api_result_1.ApiResult.error('Assignment not found', 404);
            }
            // Transform response
            const transformedAssignment = {
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
            return api_result_1.ApiResult.success(transformedAssignment, "Assignment retrieved successfully");
        }
        catch (error) {
            console.log("Error in getAssignmentById", error);
            return api_result_1.ApiResult.error(error.message || 'Failed to get assignment', 500);
        }
    }
    /**
     * Get all assignments for a collector
     */
    async getCollectorAssignments(collectorId, status) {
        try {
            const where = {
                collectorId: collectorId
            };
            if (status) {
                where.status = status;
            }
            const assignments = await config_1.prisma.assign_orders.findMany({
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
            const transformedAssignments = assignments.map((assignment) => ({
                ...assignment,
                collector: assignment.Employee,
                order: {
                    ...assignment.Order,
                    yard: assignment.Order.scrap_yards
                }
            }));
            return api_result_1.ApiResult.success(transformedAssignments, "Collector assignments retrieved successfully");
        }
        catch (error) {
            console.log("Error in getCollectorAssignments", error);
            return api_result_1.ApiResult.error(error.message || 'Failed to get collector assignments', 500);
        }
    }
    /**
     * Get all assignments for a crew
     */
    async getCrewAssignments(crewId, status) {
        try {
            const where = {
                crewId: crewId
            };
            if (status) {
                where.status = status;
            }
            const assignments = await config_1.prisma.assign_orders.findMany({
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
            const transformedAssignments = assignments.map((assignment) => ({
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
            return api_result_1.ApiResult.success(transformedAssignments, "Crew assignments retrieved successfully");
        }
        catch (error) {
            console.log("Error in getCrewAssignments", error);
            return api_result_1.ApiResult.error(error.message || 'Failed to get crew assignments', 500);
        }
    }
}
exports.AssignmentService = AssignmentService;
