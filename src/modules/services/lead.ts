import { ICreateLeadRequest, IUpdateLeadRequest, ILeadQueryParams } from "../model/lead.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { LeadStatus } from "../model/enum";

export class LeadService {
  public async createLead(data: ICreateLeadRequest): Promise<ApiResult> {
    try {

      // Check if vehicle type exists
      const vehicleType = await prisma.vehicleType.findFirst({
        where: {
          id: data.vehicleTypeId,
          organizationId: data.organizationId
        }
      });

      if (!vehicleType) {
        return ApiResult.error("Vehicle type not found", 404);
      }

      const lead = await prisma.lead.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,
          contact: data.contact,
          email: data.email,
          location: data.location,
          vehicleTypeId: data.vehicleTypeId,
          scrapCategory: data.scrapCategory,
          status: LeadStatus.PENDING
        },
        include: {
          vehicleType: true,
          organization: {
            select: {
              name: true
            }
          }
        }
      });

      return ApiResult.success(lead, "Lead created successfully", 201);

    } catch (error: any) {
      console.log("Error in createLead", error);
      return ApiResult.error(error.message);
    }
  }

  public async getLeads(query: ILeadQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, status, scrapCategory, organizationId, customerId } = query as any;

      // Coerce pagination and IDs to numbers
      const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
      const parsedOrgId = organizationId !== undefined && organizationId !== null && organizationId !== ''
        ? (typeof organizationId === 'string' ? parseInt(organizationId, 10) : Number(organizationId))
        : undefined;
      const parsedCustomerId = customerId !== undefined && customerId !== null && customerId !== ''
        ? (typeof customerId === 'string' ? parseInt(customerId, 10) : Number(customerId))
        : undefined;

      const skip = (parsedPage - 1) * parsedLimit;

      const where: any = {};

      if (parsedOrgId !== undefined && !Number.isNaN(parsedOrgId)) {
        where.organizationId = parsedOrgId;
      }

      if (parsedCustomerId !== undefined && !Number.isNaN(parsedCustomerId)) {
        where.customerId = parsedCustomerId;
      }

      if (status) {
        where.status = status;
      }

      if (scrapCategory) {
        where.scrapCategory = scrapCategory;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { contact: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
          
            vehicleType: true,
            organization: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.lead.count({ where })
      ]);

      const totalPages = Math.ceil(total / parsedLimit);

      return ApiResult.success({
        leads,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages
        }
      }, "Leads retrieved successfully");

    } catch (error: any) {
      console.log("Error in getLeads", error);
      return ApiResult.error(error.message);
    }
  }

  public async getLeadById(id: number): Promise<ApiResult> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          vehicleType: true,
          organization: {
            select: {
              name: true
            }
          }
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

  public async updateLead(id: number, data: IUpdateLeadRequest): Promise<ApiResult> {
    try {
      const existingLead = await prisma.lead.findUnique({
        where: { id }
      });

      if (!existingLead) {
        return ApiResult.error("Lead not found", 404);
      }

      // If vehicle type is being updated, check if it exists
      if (data.vehicleTypeId) {
        const vehicleType = await prisma.vehicleType.findFirst({
          where: {
            id: data.vehicleTypeId,
            organizationId: existingLead.organizationId
          }
        });

        if (!vehicleType) {
          return ApiResult.error("Vehicle type not found", 404);
        }
      }

      const lead = await prisma.lead.update({
        where: { id },
        data,
        include: {
          
          vehicleType: true,
          organization: {
            select: {
              name: true
            }
          }
        }
      });

      return ApiResult.success(lead, "Lead updated successfully");

    } catch (error: any) {
      console.log("Error in updateLead", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteLead(id: number): Promise<ApiResult> {
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

      return ApiResult.success(null, "Lead deleted successfully");

    } catch (error: any) {
      console.log("Error in deleteLead", error);
      return ApiResult.error(error.message);
    }
  }

  public async convertLead(id: number, status: LeadStatus): Promise<ApiResult> {
    try {
      const existingLead = await prisma.lead.findUnique({
        where: { id }
      });

      if (!existingLead) {
        return ApiResult.error("Lead not found", 404);
      }

      if (existingLead.status !== LeadStatus.PENDING) {
        return ApiResult.error("Lead is already processed", 400);
      }

      const lead = await prisma.lead.update({
        where: { id },
        data: { status },
        include: {
          vehicleType: true,
          organization: {
            select: {
              name: true
            }
          }
        }
      });

      const message = status === LeadStatus.CONVERTED 
        ? "Lead converted successfully" 
        : "Lead rejected successfully";

      return ApiResult.success(lead, message);

    } catch (error: any) {
      console.log("Error in convertLead", error);
      return ApiResult.error(error.message);
    }
  }

  public async getLeadStats(organizationId: number): Promise<ApiResult> {
    try {
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

      const statsMap = {
        total: totalLeads,
        pending: 0,
        converted: 0,
        rejected: 0
      };

      stats.forEach(stat => {
        if (stat.status === LeadStatus.PENDING) {
          statsMap.pending = stat._count.status;
        } else if (stat.status === LeadStatus.CONVERTED) {
          statsMap.converted = stat._count.status;
        } else if (stat.status === LeadStatus.REJECTED) {
          statsMap.rejected = stat._count.status;
        }
      });

      return ApiResult.success(statsMap, "Lead statistics retrieved successfully");

    } catch (error: any) {
      console.log("Error in getLeadStats", error);
      return ApiResult.error(error.message);
    }
  }
} 