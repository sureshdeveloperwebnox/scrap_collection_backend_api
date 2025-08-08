"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const enum_1 = require("../model/enum");
class LeadService {
    async createLead(data) {
        try {
            // Check if vehicle type exists
            const vehicleType = await config_1.prisma.vehicleType.findFirst({
                where: {
                    id: data.vehicleTypeId,
                    organizationId: data.organizationId
                }
            });
            if (!vehicleType) {
                return api_result_1.ApiResult.error("Vehicle type not found", 404);
            }
            const lead = await config_1.prisma.lead.create({
                data: {
                    organizationId: data.organizationId,
                    name: data.name,
                    contact: data.contact,
                    email: data.email,
                    location: data.location,
                    vehicleTypeId: data.vehicleTypeId,
                    scrapCategory: data.scrapCategory,
                    status: enum_1.LeadStatus.PENDING
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
            return api_result_1.ApiResult.success(lead, "Lead created successfully", 201);
        }
        catch (error) {
            console.log("Error in createLead", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getLeads(query) {
        try {
            const { page = 1, limit = 10, search, status, scrapCategory, organizationId, customerId } = query;
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
            const where = {};
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
                config_1.prisma.lead.findMany({
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
                config_1.prisma.lead.count({ where })
            ]);
            const totalPages = Math.ceil(total / parsedLimit);
            return api_result_1.ApiResult.success({
                leads,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages
                }
            }, "Leads retrieved successfully");
        }
        catch (error) {
            console.log("Error in getLeads", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getLeadById(id) {
        try {
            const lead = await config_1.prisma.lead.findUnique({
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
                return api_result_1.ApiResult.error("Lead not found", 404);
            }
            return api_result_1.ApiResult.success(lead, "Lead retrieved successfully");
        }
        catch (error) {
            console.log("Error in getLeadById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateLead(id, data) {
        try {
            const existingLead = await config_1.prisma.lead.findUnique({
                where: { id }
            });
            if (!existingLead) {
                return api_result_1.ApiResult.error("Lead not found", 404);
            }
            // If vehicle type is being updated, check if it exists
            if (data.vehicleTypeId) {
                const vehicleType = await config_1.prisma.vehicleType.findFirst({
                    where: {
                        id: data.vehicleTypeId,
                        organizationId: existingLead.organizationId
                    }
                });
                if (!vehicleType) {
                    return api_result_1.ApiResult.error("Vehicle type not found", 404);
                }
            }
            const lead = await config_1.prisma.lead.update({
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
            return api_result_1.ApiResult.success(lead, "Lead updated successfully");
        }
        catch (error) {
            console.log("Error in updateLead", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteLead(id) {
        try {
            const existingLead = await config_1.prisma.lead.findUnique({
                where: { id }
            });
            if (!existingLead) {
                return api_result_1.ApiResult.error("Lead not found", 404);
            }
            // Check if lead is already converted to an order
            const order = await config_1.prisma.order.findFirst({
                where: { leadId: id }
            });
            if (order) {
                return api_result_1.ApiResult.error("Cannot delete lead that has been converted to an order", 400);
            }
            await config_1.prisma.lead.delete({
                where: { id }
            });
            return api_result_1.ApiResult.success(null, "Lead deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteLead", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async convertLead(id, status) {
        try {
            const existingLead = await config_1.prisma.lead.findUnique({
                where: { id }
            });
            if (!existingLead) {
                return api_result_1.ApiResult.error("Lead not found", 404);
            }
            if (existingLead.status !== enum_1.LeadStatus.PENDING) {
                return api_result_1.ApiResult.error("Lead is already processed", 400);
            }
            const lead = await config_1.prisma.lead.update({
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
            const message = status === enum_1.LeadStatus.CONVERTED
                ? "Lead converted successfully"
                : "Lead rejected successfully";
            return api_result_1.ApiResult.success(lead, message);
        }
        catch (error) {
            console.log("Error in convertLead", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getLeadStats(organizationId) {
        try {
            const stats = await config_1.prisma.lead.groupBy({
                by: ['status'],
                where: { organizationId },
                _count: {
                    status: true
                }
            });
            const totalLeads = await config_1.prisma.lead.count({
                where: { organizationId }
            });
            const statsMap = {
                total: totalLeads,
                pending: 0,
                converted: 0,
                rejected: 0
            };
            stats.forEach(stat => {
                if (stat.status === enum_1.LeadStatus.PENDING) {
                    statsMap.pending = stat._count.status;
                }
                else if (stat.status === enum_1.LeadStatus.CONVERTED) {
                    statsMap.converted = stat._count.status;
                }
                else if (stat.status === enum_1.LeadStatus.REJECTED) {
                    statsMap.rejected = stat._count.status;
                }
            });
            return api_result_1.ApiResult.success(statsMap, "Lead statistics retrieved successfully");
        }
        catch (error) {
            console.log("Error in getLeadStats", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.LeadService = LeadService;
