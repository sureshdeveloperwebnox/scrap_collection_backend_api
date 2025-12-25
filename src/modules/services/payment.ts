import { ICreatePaymentRequest, IUpdatePaymentRequest, IPaymentQueryParams, ICreateRefundRequest } from "../model/payment.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { PaymentStatusEnum } from "../model/enum";

export class PaymentService {
  public async createPayment(data: ICreatePaymentRequest): Promise<ApiResult> {
    try {
      const payment = await prisma.payment.create({
        data: {
          orderId: data.orderId,
          customerId: data.customerId,
          collectorId: data.collectorId,
          amount: data.amount,
          paymentType: data.paymentType,
          receiptUrl: data.receiptUrl,
          status: PaymentStatusEnum.PAID,
          organizationId: (await prisma.order.findUnique({ where: { id: data.orderId } }))?.organizationId || 0
        },
        include: {
          Order: true,
          Customer: true,
          Employee: true
        }
      });

      // Update order payment status
      await prisma.order.update({
        where: { id: data.orderId },
        data: { paymentStatus: PaymentStatusEnum.PAID }
      });

      return ApiResult.success(payment, "Payment created successfully", 201);
    } catch (error: any) {
      console.log("Error in createPayment", error);
      return ApiResult.error(error.message);
    }
  }

  public async getPayments(query: IPaymentQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, status, paymentType, customerId, collectorId, organizationId, dateFrom, dateTo } = query as any;

      const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
      const skip = (parsedPage - 1) * parsedLimit;

      const where: any = {};

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
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            Order: true,
            Customer: true,
            Employee: true,
            refunds: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.payment.count({ where })
      ]);

      return ApiResult.success({
        payments,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }, "Payments retrieved successfully");
    } catch (error: any) {
      console.log("Error in getPayments", error);
      return ApiResult.error(error.message);
    }
  }

  public async getPaymentById(id: string): Promise<ApiResult> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          Order: true,
          Customer: true,
          Employee: true,
          refunds: true
        }
      });

      if (!payment) {
        return ApiResult.error("Payment not found", 404);
      }

      return ApiResult.success(payment, "Payment retrieved successfully");
    } catch (error: any) {
      console.log("Error in getPaymentById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updatePayment(id: string, data: IUpdatePaymentRequest): Promise<ApiResult> {
    try {
      const payment = await prisma.payment.update({
        where: { id },
        data,
        include: {
          Order: true,
          Customer: true,
          Employee: true
        }
      });

      return ApiResult.success(payment, "Payment updated successfully");
    } catch (error: any) {
      console.log("Error in updatePayment", error);
      return ApiResult.error(error.message);
    }
  }

  public async createRefund(paymentId: string, data: ICreateRefundRequest): Promise<ApiResult> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        return ApiResult.error("Payment not found", 404);
      }

      const refund = await prisma.refunds.create({
        data: {
          paymentId,
          amount: data.amount,
          reason: data.reason,
          processedByAdmin: data.processedByAdmin
        },
        include: {
          Payment: true
        }
      });

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatusEnum.REFUNDED }
      });

      // Update order payment status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: PaymentStatusEnum.REFUNDED }
      });

      return ApiResult.success(refund, "Refund created successfully", 201);
    } catch (error: any) {
      console.log("Error in createRefund", error);
      return ApiResult.error(error.message);
    }
  }
}
