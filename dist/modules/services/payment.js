"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const enum_1 = require("../model/enum");
class PaymentService {
    async createPayment(data) {
        var _a;
        try {
            const payment = await config_1.prisma.payment.create({
                data: {
                    orderId: data.orderId,
                    customerId: data.customerId,
                    collectorId: data.collectorId,
                    amount: data.amount,
                    paymentType: data.paymentType,
                    receiptUrl: data.receiptUrl,
                    status: enum_1.PaymentStatusEnum.PAID,
                    organizationId: ((_a = (await config_1.prisma.order.findUnique({ where: { id: data.orderId } }))) === null || _a === void 0 ? void 0 : _a.organizationId) || 0
                },
                include: {
                    order: true,
                    customer: true,
                    collector: true
                }
            });
            // Update order payment status
            await config_1.prisma.order.update({
                where: { id: data.orderId },
                data: { paymentStatus: enum_1.PaymentStatusEnum.PAID }
            });
            return api_result_1.ApiResult.success(payment, "Payment created successfully", 201);
        }
        catch (error) {
            console.log("Error in createPayment", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getPayments(query) {
        try {
            const { page = 1, limit = 10, search, status, paymentType, customerId, collectorId, organizationId, dateFrom, dateTo } = query;
            const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const skip = (parsedPage - 1) * parsedLimit;
            const where = {};
            if (organizationId) {
                where.organizationId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
            }
            if (status) {
                where.status = status;
            }
            if (paymentType) {
                where.paymentType = paymentType;
            }
            if (customerId) {
                where.customerId = customerId;
            }
            if (collectorId) {
                where.collectorId = collectorId;
            }
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom)
                    where.createdAt.gte = new Date(dateFrom);
                if (dateTo)
                    where.createdAt.lte = new Date(dateTo);
            }
            const [payments, total] = await Promise.all([
                config_1.prisma.payment.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        order: true,
                        customer: true,
                        collector: true,
                        refund: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                config_1.prisma.payment.count({ where })
            ]);
            return api_result_1.ApiResult.success({
                payments,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(total / parsedLimit)
                }
            }, "Payments retrieved successfully");
        }
        catch (error) {
            console.log("Error in getPayments", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getPaymentById(id) {
        try {
            const payment = await config_1.prisma.payment.findUnique({
                where: { id },
                include: {
                    order: true,
                    customer: true,
                    collector: true,
                    refund: true
                }
            });
            if (!payment) {
                return api_result_1.ApiResult.error("Payment not found", 404);
            }
            return api_result_1.ApiResult.success(payment, "Payment retrieved successfully");
        }
        catch (error) {
            console.log("Error in getPaymentById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updatePayment(id, data) {
        try {
            const payment = await config_1.prisma.payment.update({
                where: { id },
                data,
                include: {
                    order: true,
                    customer: true,
                    collector: true
                }
            });
            return api_result_1.ApiResult.success(payment, "Payment updated successfully");
        }
        catch (error) {
            console.log("Error in updatePayment", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async createRefund(paymentId, data) {
        try {
            const payment = await config_1.prisma.payment.findUnique({
                where: { id: paymentId }
            });
            if (!payment) {
                return api_result_1.ApiResult.error("Payment not found", 404);
            }
            const refund = await config_1.prisma.refund.create({
                data: {
                    paymentId,
                    amount: data.amount,
                    reason: data.reason,
                    processedByAdmin: data.processedByAdmin
                },
                include: {
                    payment: true
                }
            });
            // Update payment status
            await config_1.prisma.payment.update({
                where: { id: paymentId },
                data: { status: enum_1.PaymentStatusEnum.REFUNDED }
            });
            // Update order payment status
            await config_1.prisma.order.update({
                where: { id: payment.orderId },
                data: { paymentStatus: enum_1.PaymentStatusEnum.REFUNDED }
            });
            return api_result_1.ApiResult.success(refund, "Refund created successfully", 201);
        }
        catch (error) {
            console.log("Error in createRefund", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.PaymentService = PaymentService;
