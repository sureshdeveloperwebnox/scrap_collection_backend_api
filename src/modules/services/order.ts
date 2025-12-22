import { ICreateOrderRequest, IUpdateOrderRequest, IOrderQueryParams, IAssignOrderRequest } from "../model/order.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { OrderStatus, PaymentStatusEnum } from "../model/enum";

export class OrderService {
  /**
   * Generate unique order number with format: WO-DDMMYYYY-N
   * Example: WO-22122025-1, WO-22122025-2, etc.
   */
  private async generateOrderNumber(organizationId: number): Promise<string> {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const datePrefix = `${day}${month}${year}`;

    // Get the start and end of today for this organization
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Count orders created today for this organization
    const todayOrderCount = await prisma.order.count({
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

  public async createOrder(data: ICreateOrderRequest): Promise<ApiResult> {
    try {
      // Generate unique order number
      const orderNumber = await this.generateOrderNumber(data.organizationId);

      const order = await prisma.order.create({
        data: {
          orderNumber,
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
          orderStatus: OrderStatus.PENDING,
          paymentStatus: PaymentStatusEnum.UNPAID,
          quotedPrice: data.quotedPrice,
          yardId: data.yardId,
          crewId: data.crewId,
          routeDistance: data.routeDistance,
          routeDuration: data.routeDuration,
          customerNotes: data.customerNotes,
          adminNotes: data.adminNotes,
          customerId: data.customerId
        },
        include: {
          assignedCollector: true,
          yard: true,
          customer: true,
          lead: true,
          crew: {
            include: {
              members: true
            }
          }
        }
      });

      // Create timeline entry
      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PENDING,
          notes: `Order ${orderNumber} created`,
          performedBy: 'system'
        }
      });

      return ApiResult.success(order, "Order created successfully", 201);
    } catch (error: any) {
      console.log("Error in createOrder", error);
      return ApiResult.error(error.message);
    }
  }

  public async getOrders(query: IOrderQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, status, paymentStatus, collectorId, organizationId, dateFrom, dateTo } = query as any;

      const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
      const skip = (parsedPage - 1) * parsedLimit;

      const where: any = {};

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
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      if (search) {
        where.OR = [
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerPhone: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            assignedCollector: true,
            yard: true,
            customer: true,
            lead: true,
            crew: {
              include: {
                members: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.order.count({ where })
      ]);

      return ApiResult.success({
        orders,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }, "Orders retrieved successfully");
    } catch (error: any) {
      console.log("Error in getOrders", error);
      return ApiResult.error(error.message);
    }
  }

  public async getOrderById(id: string): Promise<ApiResult> {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          assignedCollector: true,
          yard: true,
          customer: true,
          lead: true,
          payment: true,
          review: true,
          crew: {
            include: {
              members: true
            }
          }
        }
      });

      if (!order) {
        return ApiResult.error("Order not found", 404);
      }

      return ApiResult.success(order, "Order retrieved successfully");
    } catch (error: any) {
      console.log("Error in getOrderById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateOrder(id: string, data: IUpdateOrderRequest): Promise<ApiResult> {
    try {
      const existingOrder = await prisma.order.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        return ApiResult.error("Order not found", 404);
      }

      // Remove relation fields from update data
      const {
        organizationId,
        customerId,
        leadId,
        assignedCollectorId,
        yardId,
        crewId,
        ...updateData
      } = data as any;

      const order = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          assignedCollector: true,
          yard: true,
          customer: true,
          crew: {
            include: {
              members: true
            }
          }
        }
      });

      // Create timeline entry if status changed
      if (data.orderStatus && data.orderStatus !== existingOrder.orderStatus) {
        await prisma.orderTimeline.create({
          data: {
            orderId: id,
            status: data.orderStatus,
            notes: data.adminNotes || 'Status updated',
            performedBy: 'system'
          }
        });
      }

      return ApiResult.success(order, "Order updated successfully");
    } catch (error: any) {
      console.log("Error in updateOrder", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteOrder(id: string): Promise<ApiResult> {
    try {
      const existingOrder = await prisma.order.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        return ApiResult.error("Order not found", 404);
      }

      await prisma.order.delete({
        where: { id }
      });

      return ApiResult.success(null, "Order deleted successfully");
    } catch (error: any) {
      console.log("Error in deleteOrder", error);
      return ApiResult.error(error.message);
    }
  }

  public async assignOrder(id: string, data: IAssignOrderRequest): Promise<ApiResult> {
    try {
      const order = await prisma.order.update({
        where: { id },
        data: {
          assignedCollectorId: data.collectorId,
          orderStatus: OrderStatus.ASSIGNED
        },
        include: {
          assignedCollector: true
        }
      });

      await prisma.orderTimeline.create({
        data: {
          orderId: id,
          status: OrderStatus.ASSIGNED,
          notes: `Assigned to collector`,
          performedBy: 'system'
        }
      });

      return ApiResult.success(order, "Order assigned successfully");
    } catch (error: any) {
      console.log("Error in assignOrder", error);
      return ApiResult.error(error.message);
    }
  }

  public async getOrderTimeline(id: string): Promise<ApiResult> {
    try {
      const timeline = await prisma.orderTimeline.findMany({
        where: { orderId: id },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return ApiResult.success(timeline, "Order timeline retrieved successfully");
    } catch (error: any) {
      console.log("Error in getOrderTimeline", error);
      return ApiResult.error(error.message);
    }
  }
}
