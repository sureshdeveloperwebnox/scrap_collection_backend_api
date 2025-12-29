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
      // Additional service-level validation
      if (!data.customerName || data.customerName.trim().length === 0) {
        return ApiResult.error('Customer name is required', 400);
      }

      if (!data.address || data.address.trim().length === 0) {
        return ApiResult.error('Collection address is required', 400);
      }

      if (data.address.trim().length < 5) {
        return ApiResult.error('Collection address must be at least 5 characters long', 400);
      }

      if (!data.vehicleDetails) {
        return ApiResult.error('Vehicle details are required', 400);
      }

      // Validate description only if provided
      if (data.vehicleDetails.description && data.vehicleDetails.description.trim().length > 0) {
        if (data.vehicleDetails.description.trim().length < 5) {
          return ApiResult.error('Scrap description must be at least 5 characters long', 400);
        }
      }

      if (!data.pickupTime) {
        return ApiResult.error('Pickup date and time is required', 400);
      }

      // Generate unique order number
      const orderNumber = await this.generateOrderNumber(data.organizationId);

      // If leadId is provided, fetch lead data to copy photos
      let leadPhotos = null;
      if (data.leadId) {
        const lead = await prisma.lead.findUnique({
          where: { id: data.leadId },
          select: { photos: true }
        });
        if (lead?.photos) {
          leadPhotos = lead.photos;
        }
      }

      const order = await prisma.order.create({
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
          orderStatus: data.assignedCollectorId || data.crewId ? OrderStatus.ASSIGNED : OrderStatus.PENDING,
          paymentStatus: PaymentStatusEnum.UNPAID,
          quotedPrice: data.quotedPrice,
          yardId: data.yardId,
          crewId: data.crewId,
          routeDistance: data.routeDistance,
          routeDuration: data.routeDuration,
          customerNotes: data.customerNotes,
          adminNotes: data.adminNotes,
          customerId: data.customerId,
          instructions: data.instructions?.trim()
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
      await prisma.order_timelines.create({
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

      return ApiResult.success(transformedOrder, "Order created successfully", 201);
    } catch (error: any) {
      console.log("Error in createOrder", error);

      // Provide more specific error messages
      if (error.code === 'P2002') {
        return ApiResult.error('A unique constraint violation occurred. Please check your data.', 400);
      }

      if (error.code === 'P2003') {
        return ApiResult.error('Invalid reference: One or more related records do not exist.', 400);
      }

      return ApiResult.error(error.message || 'Failed to create order', 500);
    }
  }

  public async getOrders(query: IOrderQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, status, paymentStatus, collectorId, customerId, organizationId, dateFrom, dateTo } = query as any;

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

      if (customerId) {
        where.customerId = customerId;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      if (search) {
        where.OR = [
          { customerName: { contains: search, mode: 'insensitive' } },

          { address: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
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
        prisma.order.count({ where })
      ]);

      // Transform orders to match frontend expectations
      const transformedOrders = orders.map((order: any) => ({
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

      return ApiResult.success({
        orders: transformedOrders,
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
        return ApiResult.error("Order not found", 404);
      }

      // Transform the response to match frontend expectations
      const transformedOrder: any = {
        ...order,
        collector: order.Employee,
        yard: order.scrap_yards,
        crew: order.crews ? {
          ...order.crews,
          members: order.crews.Employee || []
        } : null,
        assignOrders: order.assign_orders?.map((ao: any) => ({
          ...ao,
          collector: ao.Employee,
          crew: ao.crews ? {
            ...ao.crews,
            members: ao.crews.Employee || []
          } : null
        })) || [],
        // Keep original fields for backward compatibility
        Employee: order.Employee,
        scrap_yards: order.scrap_yards,
        crews: order.crews,
        assign_orders: order.assign_orders
      };

      return ApiResult.success(transformedOrder, "Order retrieved successfully");
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

      // Validate updated fields
      if (data.customerName !== undefined) {
        if (!data.customerName || data.customerName.trim().length === 0) {
          return ApiResult.error('Customer name cannot be empty', 400);
        }
        if (data.customerName.trim().length < 2) {
          return ApiResult.error('Customer name must be at least 2 characters long', 400);
        }
      }

      if (data.address !== undefined) {
        if (!data.address || data.address.trim().length === 0) {
          return ApiResult.error('Collection address cannot be empty', 400);
        }
        if (data.address.trim().length < 5) {
          return ApiResult.error('Collection address must be at least 5 characters long', 400);
        }
      }

      if (data.quotedPrice !== undefined && data.quotedPrice !== null && data.quotedPrice < 0) {
        return ApiResult.error('Quoted price cannot be negative', 400);
      }

      if (data.actualPrice !== undefined && data.actualPrice !== null && data.actualPrice < 0) {
        return ApiResult.error('Actual price cannot be negative', 400);
      }

      // Remove only core relation fields that should never be updated
      // Allow assignment fields (assignedCollectorId, yardId, crewId) to be updated
      const {
        organizationId,
        customerId,
        leadId,
        ...updateData
      } = data as any;

      // Sanitize text fields
      if (updateData.customerName) updateData.customerName = updateData.customerName.trim();

      if (updateData.address) updateData.address = updateData.address.trim();
      if (updateData.instructions) updateData.instructions = updateData.instructions.trim();

      const order = await prisma.order.update({
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
        await prisma.order_timelines.create({
          data: {
            orderId: id,
            status: data.orderStatus,
            notes: data.adminNotes || 'Status updated',
            performedBy: 'system'
          }
        });
      }

      // Transform the response to match frontend expectations
      const transformedOrder: any = {
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

      return ApiResult.success(transformedOrder, "Order updated successfully");
    } catch (error: any) {
      console.log("Error in updateOrder", error);

      // Provide more specific error messages
      if (error.code === 'P2002') {
        return ApiResult.error('A unique constraint violation occurred. Please check your data.', 400);
      }

      if (error.code === 'P2003') {
        return ApiResult.error('Invalid reference: One or more related records do not exist.', 400);
      }

      if (error.code === 'P2025') {
        return ApiResult.error('Order not found', 404);
      }

      return ApiResult.error(error.message || 'Failed to update order', 500);
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
      const updateData: any = {
        orderStatus: OrderStatus.ASSIGNED
      };

      // Clear existing assignments for this order
      await prisma.assign_orders.deleteMany({
        where: { orderId: id }
      });

      // Handle collector assignment
      const collectorIds: string[] = (data as any).collectorIds || [];
      if (data.collectorId && !collectorIds.includes(data.collectorId)) {
        collectorIds.push(data.collectorId);
      }

      if (collectorIds.length > 0) {
        // Create new assignments for collectors
        await Promise.all(collectorIds.map(cid =>
          prisma.assign_orders.create({
            data: {
              orderId: id,
              collectorId: cid,
              startTime: (data as any).startTime,
              endTime: (data as any).endTime,
              notes: (data as any).notes
            }
          })
        ));

        // Update Order with primary collector (first one) for backward compatibility
        updateData.assignedCollectorId = collectorIds[0];
      }

      // Handle crew assignment (if provided in the request)
      const crewId = (data as any).crewId;
      if (crewId) {
        updateData.crewId = crewId;

        // Add crew assignment record
        await prisma.assign_orders.create({
          data: {
            orderId: id,
            crewId: crewId,
            startTime: (data as any).startTime,
            endTime: (data as any).endTime,
            notes: (data as any).notes
          }
        });
      }

      // Handle yard assignment (if provided in the request)
      if ((data as any).yardId) {
        updateData.yardId = (data as any).yardId;
      }

      // Handle route information (if provided)
      if ((data as any).routeDistance) {
        updateData.routeDistance = (data as any).routeDistance;
      }
      if ((data as any).routeDuration) {
        updateData.routeDuration = (data as any).routeDuration;
      }

      const order = await prisma.order.update({
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

      await prisma.order_timelines.create({
        data: {
          orderId: id,
          status: OrderStatus.ASSIGNED,
          notes: `Order assigned to ${collectorIds.length} collectors and/or crew`,
          performedBy: 'system'
        }
      });

      // Transform the response to match frontend expectations
      const transformedOrder: any = {
        ...order,
        collector: order.Employee,
        yard: order.scrap_yards,
        crew: order.crews ? {
          ...order.crews,
          members: order.crews.Employee || []
        } : null,
        assignOrders: order.assign_orders?.map((ao: any) => ({
          ...ao,
          collector: ao.Employee,
          crew: ao.crews ? {
            ...ao.crews,
            members: ao.crews.Employee || []
          } : null
        })) || [],
        // Keep original fields for backward compatibility
        Employee: order.Employee,
        scrap_yards: order.scrap_yards,
        crews: order.crews,
        assign_orders: order.assign_orders
      };

      return ApiResult.success(transformedOrder, "Order assigned successfully");
    } catch (error: any) {
      console.log("Error in assignOrder", error);
      return ApiResult.error(error.message);
    }
  }

  public async getOrderTimeline(id: string): Promise<ApiResult> {
    try {
      const timeline = await prisma.order_timelines.findMany({
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

  public async getOrderStats(organizationId?: number): Promise<ApiResult> {
    try {
      const where: any = {};
      if (organizationId) {
        where.organizationId = organizationId;
      }

      const [total, pending, assigned, inProgress, completed, cancelled] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.count({ where: { ...where, orderStatus: OrderStatus.PENDING } }),
        prisma.order.count({ where: { ...where, orderStatus: OrderStatus.ASSIGNED } }),
        prisma.order.count({ where: { ...where, orderStatus: OrderStatus.IN_PROGRESS } }),
        prisma.order.count({ where: { ...where, orderStatus: OrderStatus.COMPLETED } }),
        prisma.order.count({ where: { ...where, orderStatus: OrderStatus.CANCELLED } })
      ]);

      return ApiResult.success({
        total,
        pending,
        assigned,
        inProgress,
        completed,
        cancelled
      }, "Order stats retrieved successfully");
    } catch (error: any) {
      console.log("Error in getOrderStats", error);
      return ApiResult.error(error.message);
    }
  }
}
