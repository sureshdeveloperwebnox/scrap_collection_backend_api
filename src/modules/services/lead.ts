import { ICreateLeadRequest, IUpdateLeadRequest, ILeadQueryParams, IConvertLeadToOrderRequest } from "../model/lead.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { LeadStatus } from "../model/enum";
import { cacheService } from "../../utils/cache";
import { storageService } from "../../utils/storage.service";

export class LeadService {
  /**
   * Normalize photo paths - convert full URLs to relative paths
   */
  private normalizePhotoPaths(photos: string[] | undefined): string[] {
    if (!photos || !Array.isArray(photos)) return [];
    return photos.map(photo => storageService.getRelativePath(photo));
  }

  public async createLead(data: ICreateLeadRequest): Promise<ApiResult> {
    try {
      // Normalize photo paths before saving
      const normalizedPhotos = this.normalizePhotoPaths(data.photos);

      const lead = await prisma.lead.create({
        data: {
          organizationId: data.organizationId,
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          vehicleType: data.vehicleType,
          vehicleMake: data.vehicleMake,
          vehicleModel: data.vehicleModel,
          vehicleYear: data.vehicleYear,
          vehicleCondition: data.vehicleCondition,
          locationAddress: data.locationAddress,
          latitude: data.latitude,
          longitude: data.longitude,
          leadSource: data.leadSource,
          photos: normalizedPhotos,
          notes: data.notes,
          status: LeadStatus.NEW,
          ...(data.customerId && { customerId: data.customerId })
        },
        include: {
          Organization: {
            select: {
              name: true
            }
          },
          Customer: true
        }
      });

      // Create timeline entry
      await prisma.lead_timelines.create({
        data: {
          leadId: lead.id,
          activity: 'Lead created',
          performedBy: 'system'
        }
      });

      // Invalidate leads cache and stats cache
      cacheService.deletePattern('^leads:');
      cacheService.deletePattern('^lead-stats:');

      return ApiResult.success(lead, "Lead created successfully", 201);
    } catch (error: any) {
      console.log("Error in createLead", error);
      return ApiResult.error(error.message);
    }
  }

  public async getLeads(query: ILeadQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, status, vehicleType, vehicleCondition, leadSource, organizationId, dateFrom, dateTo, sortBy, sortOrder } = query as any;

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

      if (vehicleType) {
        where.vehicleType = vehicleType;
      }

      if (vehicleCondition) {
        where.vehicleCondition = vehicleCondition;
      }

      if (leadSource) {
        where.leadSource = leadSource;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { locationAddress: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Build orderBy clause for optimized sorting
      const orderBy: any = {};
      if (sortBy) {
        const validSortFields = ['fullName', 'phone', 'email', 'status', 'createdAt', 'updatedAt'];
        if (validSortFields.includes(sortBy)) {
          orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
        } else {
          orderBy.createdAt = 'desc'; // Default fallback
        }
      } else {
        orderBy.createdAt = 'desc'; // Default sorting
      }

      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            Organization: {
              select: {
                name: true
              }
            },
            Customer: true
          },
          orderBy
        }),
        prisma.lead.count({ where })
      ]);

      return ApiResult.success({
        leads,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }, "Leads retrieved successfully");
    } catch (error: any) {
      console.log("Error in getLeads", error);
      return ApiResult.error(error.message);
    }
  }

  public async getLeadById(id: string): Promise<ApiResult> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          Organization: {
            select: {
              name: true
            }
          },
          Customer: true,
          Order: true
        }
      });

      if (!lead) {
        return ApiResult.error("Lead not found", 404);
      }

      return ApiResult.success(lead, "Lead retrieved successfully");
    } catch (error: any) {
      console.log("Error in getLeadById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateLead(id: string, data: IUpdateLeadRequest): Promise<ApiResult> {
    try {
      const existingLead = await prisma.lead.findUnique({
        where: { id }
      });

      if (!existingLead) {
        return ApiResult.error("Lead not found", 404);
      }

      // Build update data object, including all provided fields
      const updateData: any = {};

      // Always update fullName and phone if provided (they are required fields)
      // These should always be provided in update requests
      if (data.fullName !== undefined && data.fullName !== null) {
        const trimmedName = String(data.fullName).trim();
        if (trimmedName !== '') {
          updateData.fullName = trimmedName;
        }
      }
      if (data.phone !== undefined && data.phone !== null) {
        const trimmedPhone = String(data.phone).trim();
        if (trimmedPhone !== '' && trimmedPhone !== '+') {
          updateData.phone = trimmedPhone;
        }
      }

      // Include optional fields
      if (data.email !== undefined) updateData.email = data.email;
      if (data.vehicleType !== undefined) updateData.vehicleType = data.vehicleType;
      if (data.vehicleMake !== undefined) updateData.vehicleMake = data.vehicleMake;
      if (data.vehicleModel !== undefined) updateData.vehicleModel = data.vehicleModel;
      if (data.vehicleYear !== undefined) updateData.vehicleYear = data.vehicleYear;
      if (data.vehicleCondition !== undefined) updateData.vehicleCondition = data.vehicleCondition;
      if (data.locationAddress !== undefined) updateData.locationAddress = data.locationAddress;
      if (data.latitude !== undefined) updateData.latitude = data.latitude;
      if (data.longitude !== undefined) updateData.longitude = data.longitude;
      if (data.leadSource !== undefined) updateData.leadSource = data.leadSource;
      if (data.photos !== undefined) {
        // Normalize photo paths before saving
        updateData.photos = this.normalizePhotoPaths(data.photos);
      }
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.status !== undefined) updateData.status = data.status;

      // Log for debugging
      console.log('Update lead - received data:', JSON.stringify(data, null, 2));
      console.log('Update lead - updateData:', JSON.stringify(updateData, null, 2));

      // Ensure we have at least one field to update
      if (Object.keys(updateData).length === 0) {
        return ApiResult.error("No fields provided for update", 400);
      }

      // Ensure fullName and phone are present if they're being updated
      if (updateData.fullName === undefined && updateData.phone === undefined) {
        console.warn('Warning: Neither fullName nor phone provided in update');
      }

      const lead = await prisma.lead.update({
        where: { id },
        data: updateData,
        include: {
          Organization: {
            select: {
              name: true
            }
          },
          Customer: true
        }
      });

      console.log('Update lead - updated lead:', lead);

      // Create timeline entry
      await prisma.lead_timelines.create({
        data: {
          leadId: id,
          activity: 'Lead updated',
          performedBy: 'system'
        }
      });

      // Invalidate leads cache and stats cache
      cacheService.deletePattern('^leads:');
      cacheService.deletePattern('^lead-stats:');

      return ApiResult.success(lead, "Lead updated successfully");
    } catch (error: any) {
      console.log("Error in updateLead", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteLead(id: string): Promise<ApiResult> {
    try {
      const existingLead = await prisma.lead.findUnique({
        where: { id }
      });

      if (!existingLead) {
        return ApiResult.error("Lead not found", 404);
      }

      // Check if lead is already converted to an order
      const order = await prisma.order.findFirst({
        where: { leadId: id }
      });

      if (order) {
        return ApiResult.error("Cannot delete lead that has been converted to an order", 400);
      }

      await prisma.lead.delete({
        where: { id }
      });

      // Invalidate leads cache and stats cache
      cacheService.deletePattern('^leads:');
      cacheService.deletePattern('^lead-stats:');

      return ApiResult.success(null, "Lead deleted successfully");
    } catch (error: any) {
      console.log("Error in deleteLead", error);
      return ApiResult.error(error.message);
    }
  }

  public async convertLeadToOrder(id: string, data: IConvertLeadToOrderRequest): Promise<ApiResult> {
    try {
      const existingLead = await prisma.lead.findUnique({
        where: { id }
      });

      if (!existingLead) {
        return ApiResult.error("Lead not found", 404);
      }

      if (existingLead.status === LeadStatus.CONVERTED) {
        return ApiResult.error("Lead is already converted", 400);
      }

      // Create order from lead
      const order = await prisma.order.create({
        data: {
          organizationId: existingLead.organizationId,
          leadId: id,
          customerName: existingLead.fullName,
          address: existingLead.locationAddress || '',
          latitude: existingLead.latitude,
          longitude: existingLead.longitude,
          vehicleDetails: {
            make: existingLead.vehicleMake,
            model: existingLead.vehicleModel,
            year: existingLead.vehicleYear,
            condition: existingLead.vehicleCondition
          },
          assignedCollectorId: data.assignedCollectorId,
          pickupTime: data.pickupTime,
          quotedPrice: data.quotedPrice,
          yardId: data.yardId,
          customerNotes: data.customerNotes,
          adminNotes: data.adminNotes,
          customerId: existingLead.customerId,
          orderStatus: 'PENDING',
          paymentStatus: 'UNPAID'
        }
      });

      // Update lead status
      await prisma.lead.update({
        where: { id },
        data: { status: LeadStatus.CONVERTED }
      });

      // Invalidate leads cache and stats cache
      cacheService.deletePattern('^leads:');
      cacheService.deletePattern('^lead-stats:');

      // Create timeline entries
      await prisma.lead_timelines.create({
        data: {
          leadId: id,
          activity: 'Lead converted to order',
          performedBy: 'system'
        }
      });

      await prisma.order_timelines.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          notes: 'Order created from lead',
          performedBy: 'system'
        }
      });

      return ApiResult.success(order, "Lead converted to order successfully");
    } catch (error: any) {
      console.log("Error in convertLeadToOrder", error);
      return ApiResult.error(error.message);
    }
  }

  public async getLeadTimeline(id: string): Promise<ApiResult> {
    try {
      const timeline = await prisma.lead_timelines.findMany({
        where: { leadId: id },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return ApiResult.success(timeline, "Lead timeline retrieved successfully");
    } catch (error: any) {
      console.log("Error in getLeadTimeline", error);
      return ApiResult.error(error.message);
    }
  }

  public async getLeadStats(organizationId: number): Promise<ApiResult> {
    try {
      // Build cache key for stats
      const cacheKey = cacheService.generateKey('lead-stats', { organizationId });

      // Try to get from cache
      const cachedResult = cacheService.get<any>(cacheKey);
      if (cachedResult) {
        return ApiResult.success(cachedResult, "Lead statistics retrieved successfully (cached)");
      }

      // Fetch stats from database
      const stats = await prisma.lead.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: {
          status: true
        }
      });

      const totalLeads = await prisma.lead.count({
        where: { organizationId }
      });

      const statsMap: any = {
        total: totalLeads,
        new: 0,
        contacted: 0,
        quoted: 0,
        converted: 0,
        rejected: 0
      };

      stats.forEach(stat => {
        statsMap[stat.status.toLowerCase()] = stat._count.status;
      });

      // Cache the result for 2 minutes (stats change frequently)
      cacheService.set(cacheKey, statsMap, 2 * 60 * 1000);

      return ApiResult.success(statsMap, "Lead statistics retrieved successfully");
    } catch (error: any) {
      console.log("Error in getLeadStats", error);
      return ApiResult.error(error.message);
    }
  }

  public async convertLeadToCustomer(id: string): Promise<ApiResult> {
    try {
      const existingLead = await prisma.lead.findUnique({
        where: { id }
      });

      if (!existingLead) {
        return ApiResult.error("Lead not found", 404);
      }

      if (existingLead.status === LeadStatus.CONVERTED) {
        return ApiResult.error("Lead is already converted", 400);
      }

      // Check if customer already exists for this phone in this organization
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          phone: existingLead.phone,
          organizationId: existingLead.organizationId
        }
      });

      if (existingCustomer) {
        // Update lead status to CONVERTED and link to existing customer
        await prisma.lead.update({
          where: { id },
          data: {
            status: LeadStatus.CONVERTED,
            customerId: existingCustomer.id
          }
        });

        // Create timeline entry
        await prisma.lead_timelines.create({
          data: {
            leadId: id,
            activity: 'Lead converted to existing customer',
            performedBy: 'system'
          }
        });

        // Invalidate leads cache and stats cache
        cacheService.deletePattern('^leads:');
        cacheService.deletePattern('^lead-stats:');

        return ApiResult.success({
          leadId: id,
          customerId: existingCustomer.id,
          message: 'Lead linked to existing customer'
        }, "Lead converted to existing customer successfully");
      }

      // Create new customer from lead
      const customer = await prisma.customer.create({
        data: {
          organizationId: existingLead.organizationId,
          name: existingLead.fullName,
          phone: existingLead.phone,
          email: existingLead.email,
          address: existingLead.locationAddress,
          latitude: existingLead.latitude,
          longitude: existingLead.longitude,
          vehicleType: existingLead.vehicleType,
          vehicleMake: existingLead.vehicleMake,
          vehicleModel: existingLead.vehicleModel,
          vehicleYear: existingLead.vehicleYear,
          vehicleCondition: existingLead.vehicleCondition,
          accountStatus: 'ACTIVE'
        }
      });

      // Update lead status to CONVERTED and link to new customer
      await prisma.lead.update({
        where: { id },
        data: {
          status: LeadStatus.CONVERTED,
          customerId: customer.id
        }
      });

      // Create timeline entry
      await prisma.lead_timelines.create({
        data: {
          leadId: id,
          activity: 'Lead converted to customer',
          performedBy: 'system'
        }
      });

      // Invalidate leads cache and stats cache
      cacheService.deletePattern('^leads:');
      cacheService.deletePattern('^lead-stats:');

      return ApiResult.success({
        leadId: id,
        customerId: customer.id
      }, "Lead converted to customer successfully");
    } catch (error: any) {
      console.log("Error in convertLeadToCustomer", error);
      return ApiResult.error(error.message);
    }
  }
}
