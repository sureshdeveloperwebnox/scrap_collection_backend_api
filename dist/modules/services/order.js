"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const enum_1 = require("../model/enum");
class OrderService {
    /**
     * Generate unique order number with format: WO-DDMMYYYY-N
     * Example: WO-22122025-1, WO-22122025-2, etc.
     */
    async generateOrderNumber(organizationId) {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const datePrefix = `${day}${month}${year}`;
        // Get the start and end of today for this organization
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        // Count orders created today for this organization
        const todayOrderCount = await config_1.prisma.order.count({
            where: {
                organizationId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });
        // Sequential number for today (starts from 1)
        const sequentialNumber = todayOrderCount + 1;
        // Format: WO-DDMMYYYY-N
        return `WO-${datePrefix}-${sequentialNumber}`;
    }
    async createOrder(data) {
        var _a;
        try {
            // Additional service-level validation
            if (!data.customerName || data.customerName.trim().length === 0) {
                return api_result_1.ApiResult.error('Customer name is required', 400);
            }
            if (!data.address || data.address.trim().length === 0) {
                return api_result_1.ApiResult.error('Collection address is required', 400);
            }
            if (data.address.trim().length < 5) {
                return api_result_1.ApiResult.error('Collection address must be at least 5 characters long', 400);
            }
            if (!data.vehicleDetails) {
                return api_result_1.ApiResult.error('Vehicle details are required', 400);
            }
            // Validate description only if provided
            if (data.vehicleDetails.description && data.vehicleDetails.description.trim().length > 0) {
                if (data.vehicleDetails.description.trim().length < 5) {
                    return api_result_1.ApiResult.error('Scrap description must be at least 5 characters long', 400);
                }
            }
            if (!data.pickupTime) {
                return api_result_1.ApiResult.error('Pickup date and time is required', 400);
            }
            // Generate unique order number
            const orderNumber = await this.generateOrderNumber(data.organizationId);
            // If leadId is provided, fetch lead data to copy photos
            let leadPhotos = null;
            if (data.leadId) {
                const lead = await config_1.prisma.lead.findUnique({
                    where: { id: data.leadId },
                    select: { photos: true }
                });
                if (lead === null || lead === void 0 ? void 0 : lead.photos) {
                    leadPhotos = lead.photos;
                }
            }
            const order = await config_1.prisma.order.create({
                data: {
                    orderNumber,
                    organizationId: data.organizationId,
                    leadId: data.leadId,
                    customerName: data.customerName.trim(),
                    customerEmail: data.customerEmail,
                    address: data.address.trim(),
                    latitude: data.latitude,
                    longitude: data.longitude,
                    vehicleDetails: data.vehicleDetails,
                    photos: leadPhotos || data.photos,
                    assignedCollectorId: data.assignedCollectorId,
                    pickupTime: data.pickupTime,
                    orderStatus: data.assignedCollectorId || data.crewId ? enum_1.OrderStatus.ASSIGNED : enum_1.OrderStatus.PENDING,
                    paymentStatus: enum_1.PaymentStatusEnum.UNPAID,
                    quotedPrice: data.quotedPrice,
                    yardId: data.yardId,
                    crewId: data.crewId,
                    routeDistance: data.routeDistance,
                    routeDuration: data.routeDuration,
                    customerNotes: data.customerNotes,
                    adminNotes: data.adminNotes,
                    customerId: data.customerId,
                    instructions: (_a = data.instructions) === null || _a === void 0 ? void 0 : _a.trim()
                },
                include: {
                    Employee: true,
                    scrap_yards: true,
                    Customer: true,
                    Lead: true,
                    crews: {
                        include: {
                            Employee: true
                        }
                    }
                }
            });
            // Create timeline entry
            await config_1.prisma.order_timelines.create({
                data: {
                    orderId: order.id,
                    status: order.orderStatus,
                    notes: `Order ${orderNumber} created`,
                    performedBy: 'system'
                }
            });
            // Transform the response to match frontend expectations
            const transformedOrder = {
                ...order,
                collector: order.Employee,
                yard: order.scrap_yards,
                crew: order.crews ? {
                    ...order.crews,
                    members: order.crews.Employee || []
                } : null,
                // Keep original fields for backward compatibility
                Employee: order.Employee,
                scrap_yards: order.scrap_yards,
                crews: order.crews
            };
            return api_result_1.ApiResult.success(transformedOrder, "Order created successfully", 201);
        }
        catch (error) {
            console.log("Error in createOrder", error);
            // Provide more specific error messages
            if (error.code === 'P2002') {
                return api_result_1.ApiResult.error('A unique constraint violation occurred. Please check your data.', 400);
            }
            if (error.code === 'P2003') {
                return api_result_1.ApiResult.error('Invalid reference: One or more related records do not exist.', 400);
            }
            return api_result_1.ApiResult.error(error.message || 'Failed to create order', 500);
        }
    }
    async getOrders(query) {
        try {
            const { page = 1, limit = 10, search, status, paymentStatus, collectorId, organizationId, dateFrom, dateTo } = query;
            const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const skip = (parsedPage - 1) * parsedLimit;
            const where = {};
            if (organizationId) {
                where.organizationId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
            }
            if (status) {
                where.orderStatus = status;
            }
            if (paymentStatus) {
                where.paymentStatus = paymentStatus;
            }
            if (collectorId) {
                where.assignedCollectorId = collectorId;
            }
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom)
                    where.createdAt.gte = new Date(dateFrom);
                if (dateTo)
                    where.createdAt.lte = new Date(dateTo);
            }
            if (search) {
                where.OR = [
                    { customerName: { contains: search, mode: 'insensitive' } },
                    { address: { contains: search, mode: 'insensitive' } }
                ];
            }
            const [orders, total] = await Promise.all([
                config_1.prisma.order.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        Employee: true,
                        scrap_yards: true,
                        Customer: true,
                        Lead: true,
                        crews: {
                            include: {
                                Employee: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                config_1.prisma.order.count({ where })
            ]);
            // Transform orders to match frontend expectations
            const transformedOrders = orders.map((order) => ({
                ...order,
                collector: order.Employee,
                yard: order.scrap_yards,
                crew: order.crews ? {
                    ...order.crews,
                    members: order.crews.Employee || []
                } : null,
                // Keep original fields for backward compatibility
                Employee: order.Employee,
                scrap_yards: order.scrap_yards,
                crews: order.crews
            }));
            return api_result_1.ApiResult.success({
                orders: transformedOrders,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(total / parsedLimit)
                }
            }, "Orders retrieved successfully");
        }
        catch (error) {
            console.log("Error in getOrders", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getOrderById(id) {
        var _a;
        try {
            const order = await config_1.prisma.order.findUnique({
                where: { id },
                include: {
                    Employee: true,
                    scrap_yards: true,
                    Customer: true,
                    Lead: true,
                    Payment: true,
                    Review: true,
                    crews: {
                        include: {
                            Employee: true
                        }
                    },
                    assign_orders: {
                        include: {
                            Employee: true,
                            crews: {
                                include: {
                                    Employee: true
                                }
                            }
                        }
                    }
                }
            });
            if (!order) {
                return api_result_1.ApiResult.error("Order not found", 404);
            }
            // Transform the response to match frontend expectations
            const transformedOrder = {
                ...order,
                collector: order.Employee,
                yard: order.scrap_yards,
                crew: order.crews ? {
                    ...order.crews,
                    members: order.crews.Employee || []
                } : null,
                assignOrders: ((_a = order.assign_orders) === null || _a === void 0 ? void 0 : _a.map((ao) => ({
                    ...ao,
                    collector: ao.Employee,
                    crew: ao.crews ? {
                        ...ao.crews,
                        members: ao.crews.Employee || []
                    } : null
                }))) || [],
                // Keep original fields for backward compatibility
                Employee: order.Employee,
                scrap_yards: order.scrap_yards,
                crews: order.crews,
                assign_orders: order.assign_orders
            };
            return api_result_1.ApiResult.success(transformedOrder, "Order retrieved successfully");
        }
        catch (error) {
            console.log("Error in getOrderById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateOrder(id, data) {
        try {
            const existingOrder = await config_1.prisma.order.findUnique({
                where: { id }
            });
            if (!existingOrder) {
                return api_result_1.ApiResult.error("Order not found", 404);
            }
            // Validate updated fields
            if (data.customerName !== undefined) {
                if (!data.customerName || data.customerName.trim().length === 0) {
                    return api_result_1.ApiResult.error('Customer name cannot be empty', 400);
                }
                if (data.customerName.trim().length < 2) {
                    return api_result_1.ApiResult.error('Customer name must be at least 2 characters long', 400);
                }
            }
            if (data.address !== undefined) {
                if (!data.address || data.address.trim().length === 0) {
                    return api_result_1.ApiResult.error('Collection address cannot be empty', 400);
                }
                if (data.address.trim().length < 5) {
                    return api_result_1.ApiResult.error('Collection address must be at least 5 characters long', 400);
                }
            }
            if (data.quotedPrice !== undefined && data.quotedPrice !== null && data.quotedPrice < 0) {
                return api_result_1.ApiResult.error('Quoted price cannot be negative', 400);
            }
            if (data.actualPrice !== undefined && data.actualPrice !== null && data.actualPrice < 0) {
                return api_result_1.ApiResult.error('Actual price cannot be negative', 400);
            }
            // Remove only core relation fields that should never be updated
            // Allow assignment fields (assignedCollectorId, yardId, crewId) to be updated
            const { organizationId, customerId, leadId, ...updateData } = data;
            // Sanitize text fields
            if (updateData.customerName)
                updateData.customerName = updateData.customerName.trim();
            if (updateData.address)
                updateData.address = updateData.address.trim();
            if (updateData.instructions)
                updateData.instructions = updateData.instructions.trim();
            const order = await config_1.prisma.order.update({
                where: { id },
                data: updateData,
                include: {
                    Employee: true,
                    scrap_yards: true,
                    Customer: true,
                    crews: {
                        include: {
                            Employee: true
                        }
                    }
                }
            });
            // Create timeline entry if status changed
            if (data.orderStatus && data.orderStatus !== existingOrder.orderStatus) {
                await config_1.prisma.order_timelines.create({
                    data: {
                        orderId: id,
                        status: data.orderStatus,
                        notes: data.adminNotes || 'Status updated',
                        performedBy: 'system'
                    }
                });
            }
            // Transform the response to match frontend expectations
            const transformedOrder = {
                ...order,
                collector: order.Employee,
                yard: order.scrap_yards,
                crew: order.crews ? {
                    ...order.crews,
                    members: order.crews.Employee || []
                } : null,
                // Keep original fields for backward compatibility
                Employee: order.Employee,
                scrap_yards: order.scrap_yards,
                crews: order.crews
            };
            return api_result_1.ApiResult.success(transformedOrder, "Order updated successfully");
        }
        catch (error) {
            console.log("Error in updateOrder", error);
            // Provide more specific error messages
            if (error.code === 'P2002') {
                return api_result_1.ApiResult.error('A unique constraint violation occurred. Please check your data.', 400);
            }
            if (error.code === 'P2003') {
                return api_result_1.ApiResult.error('Invalid reference: One or more related records do not exist.', 400);
            }
            if (error.code === 'P2025') {
                return api_result_1.ApiResult.error('Order not found', 404);
            }
            return api_result_1.ApiResult.error(error.message || 'Failed to update order', 500);
        }
    }
    async deleteOrder(id) {
        try {
            const existingOrder = await config_1.prisma.order.findUnique({
                where: { id }
            });
            if (!existingOrder) {
                return api_result_1.ApiResult.error("Order not found", 404);
            }
            await config_1.prisma.order.delete({
                where: { id }
            });
            return api_result_1.ApiResult.success(null, "Order deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteOrder", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async assignOrder(id, data) {
        var _a;
        try {
            const updateData = {
                orderStatus: enum_1.OrderStatus.ASSIGNED
            };
            // Clear existing assignments for this order
            await config_1.prisma.assign_orders.deleteMany({
                where: { orderId: id }
            });
            // Handle collector assignment
            const collectorIds = data.collectorIds || [];
            if (data.collectorId && !collectorIds.includes(data.collectorId)) {
                collectorIds.push(data.collectorId);
            }
            if (collectorIds.length > 0) {
                // Create new assignments for collectors
                await Promise.all(collectorIds.map(cid => config_1.prisma.assign_orders.create({
                    data: {
                        orderId: id,
                        collectorId: cid,
                        startTime: data.startTime,
                        endTime: data.endTime,
                        notes: data.notes
                    }
                })));
                // Update Order with primary collector (first one) for backward compatibility
                updateData.assignedCollectorId = collectorIds[0];
            }
            // Handle crew assignment (if provided in the request)
            const crewId = data.crewId;
            if (crewId) {
                updateData.crewId = crewId;
                // Add crew assignment record
                await config_1.prisma.assign_orders.create({
                    data: {
                        orderId: id,
                        crewId: crewId,
                        startTime: data.startTime,
                        endTime: data.endTime,
                        notes: data.notes
                    }
                });
            }
            // Handle yard assignment (if provided in the request)
            if (data.yardId) {
                updateData.yardId = data.yardId;
            }
            // Handle route information (if provided)
            if (data.routeDistance) {
                updateData.routeDistance = data.routeDistance;
            }
            if (data.routeDuration) {
                updateData.routeDuration = data.routeDuration;
            }
            const order = await config_1.prisma.order.update({
                where: { id },
                data: updateData,
                include: {
                    Employee: true,
                    scrap_yards: true,
                    Customer: true,
                    Lead: true,
                    assign_orders: {
                        include: {
                            Employee: true,
                            crews: {
                                include: {
                                    Employee: true
                                }
                            }
                        }
                    },
                    crews: {
                        include: {
                            Employee: true
                        }
                    }
                }
            });
            await config_1.prisma.order_timelines.create({
                data: {
                    orderId: id,
                    status: enum_1.OrderStatus.ASSIGNED,
                    notes: `Order assigned to ${collectorIds.length} collectors and/or crew`,
                    performedBy: 'system'
                }
            });
            // Transform the response to match frontend expectations
            const transformedOrder = {
                ...order,
                collector: order.Employee,
                yard: order.scrap_yards,
                crew: order.crews ? {
                    ...order.crews,
                    members: order.crews.Employee || []
                } : null,
                assignOrders: ((_a = order.assign_orders) === null || _a === void 0 ? void 0 : _a.map((ao) => ({
                    ...ao,
                    collector: ao.Employee,
                    crew: ao.crews ? {
                        ...ao.crews,
                        members: ao.crews.Employee || []
                    } : null
                }))) || [],
                // Keep original fields for backward compatibility
                Employee: order.Employee,
                scrap_yards: order.scrap_yards,
                crews: order.crews,
                assign_orders: order.assign_orders
            };
            return api_result_1.ApiResult.success(transformedOrder, "Order assigned successfully");
        }
        catch (error) {
            console.log("Error in assignOrder", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getOrderTimeline(id) {
        try {
            const timeline = await config_1.prisma.order_timelines.findMany({
                where: { orderId: id },
                orderBy: {
                    createdAt: 'asc'
                }
            });
            return api_result_1.ApiResult.success(timeline, "Order timeline retrieved successfully");
        }
        catch (error) {
            console.log("Error in getOrderTimeline", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getOrderStats(organizationId) {
        try {
            const where = {};
            if (organizationId) {
                where.organizationId = organizationId;
            }
            const [total, pending, assigned, inProgress, completed, cancelled] = await Promise.all([
                config_1.prisma.order.count({ where }),
                config_1.prisma.order.count({ where: { ...where, orderStatus: enum_1.OrderStatus.PENDING } }),
                config_1.prisma.order.count({ where: { ...where, orderStatus: enum_1.OrderStatus.ASSIGNED } }),
                config_1.prisma.order.count({ where: { ...where, orderStatus: enum_1.OrderStatus.IN_PROGRESS } }),
                config_1.prisma.order.count({ where: { ...where, orderStatus: enum_1.OrderStatus.COMPLETED } }),
                config_1.prisma.order.count({ where: { ...where, orderStatus: enum_1.OrderStatus.CANCELLED } })
            ]);
            return api_result_1.ApiResult.success({
                total,
                pending,
                assigned,
                inProgress,
                completed,
                cancelled
            }, "Order stats retrieved successfully");
        }
        catch (error) {
            console.log("Error in getOrderStats", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.OrderService = OrderService;
