"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const enum_1 = require("../model/enum");
class OrderService {
    async createOrder(data) {
        try {
            const order = await config_1.prisma.order.create({
                data: {
                    organizationId: data.organizationId,
                    leadId: data.leadId,
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    address: data.address,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    vehicleDetails: data.vehicleDetails,
                    assignedCollectorId: data.assignedCollectorId,
                    pickupTime: data.pickupTime,
                    orderStatus: enum_1.OrderStatus.PENDING,
                    paymentStatus: enum_1.PaymentStatusEnum.UNPAID,
                    quotedPrice: data.quotedPrice,
                    yardId: data.yardId,
                    customerNotes: data.customerNotes,
                    adminNotes: data.adminNotes,
                    customerId: data.customerId
                },
                include: {
                    assignedCollector: true,
                    yard: true,
                    customer: true,
                    lead: true
                }
            });
            // Create timeline entry
            await config_1.prisma.orderTimeline.create({
                data: {
                    orderId: order.id,
                    status: enum_1.OrderStatus.PENDING,
                    notes: 'Order created',
                    performedBy: 'system'
                }
            });
            return api_result_1.ApiResult.success(order, "Order created successfully", 201);
        }
        catch (error) {
            console.log("Error in createOrder", error);
            return api_result_1.ApiResult.error(error.message);
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
                    { customerPhone: { contains: search, mode: 'insensitive' } },
                    { address: { contains: search, mode: 'insensitive' } }
                ];
            }
            const [orders, total] = await Promise.all([
                config_1.prisma.order.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        assignedCollector: true,
                        yard: true,
                        customer: true,
                        lead: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                config_1.prisma.order.count({ where })
            ]);
            return api_result_1.ApiResult.success({
                orders,
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
        try {
            const order = await config_1.prisma.order.findUnique({
                where: { id },
                include: {
                    assignedCollector: true,
                    yard: true,
                    customer: true,
                    lead: true,
                    payment: true,
                    review: true
                }
            });
            if (!order) {
                return api_result_1.ApiResult.error("Order not found", 404);
            }
            return api_result_1.ApiResult.success(order, "Order retrieved successfully");
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
            const order = await config_1.prisma.order.update({
                where: { id },
                data,
                include: {
                    assignedCollector: true,
                    yard: true,
                    customer: true
                }
            });
            // Create timeline entry if status changed
            if (data.orderStatus && data.orderStatus !== existingOrder.orderStatus) {
                await config_1.prisma.orderTimeline.create({
                    data: {
                        orderId: id,
                        status: data.orderStatus,
                        notes: data.adminNotes || 'Status updated',
                        performedBy: 'system'
                    }
                });
            }
            return api_result_1.ApiResult.success(order, "Order updated successfully");
        }
        catch (error) {
            console.log("Error in updateOrder", error);
            return api_result_1.ApiResult.error(error.message);
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
        try {
            const order = await config_1.prisma.order.update({
                where: { id },
                data: {
                    assignedCollectorId: data.collectorId,
                    orderStatus: enum_1.OrderStatus.ASSIGNED
                },
                include: {
                    assignedCollector: true
                }
            });
            await config_1.prisma.orderTimeline.create({
                data: {
                    orderId: id,
                    status: enum_1.OrderStatus.ASSIGNED,
                    notes: `Assigned to collector`,
                    performedBy: 'system'
                }
            });
            return api_result_1.ApiResult.success(order, "Order assigned successfully");
        }
        catch (error) {
            console.log("Error in assignOrder", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getOrderTimeline(id) {
        try {
            const timeline = await config_1.prisma.orderTimeline.findMany({
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
}
exports.OrderService = OrderService;
