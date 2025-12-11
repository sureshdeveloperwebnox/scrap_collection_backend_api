"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const enum_1 = require("../model/enum");
class LeadService {
    async createLead(data) {
        try {
            const lead = await config_1.prisma.lead.create({
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
                    photos: data.photos || [],
                    notes: data.notes,
                    status: enum_1.LeadStatus.NEW,
                    ...(data.customerId && { customerId: data.customerId })
                },
                include: {
                    organization: {
                        select: {
                            name: true
                        }
                    },
                    customer: true
                }
            });
            // Create timeline entry
            await config_1.prisma.leadTimeline.create({
                data: {
                    leadId: lead.id,
                    activity: 'Lead created',
                    performedBy: 'system'
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
            const { page = 1, limit = 10, search, status, vehicleType, leadSource, organizationId, dateFrom, dateTo } = query;
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
            if (vehicleType) {
                where.vehicleType = vehicleType;
            }
            if (leadSource) {
                where.leadSource = leadSource;
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
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { locationAddress: { contains: search, mode: 'insensitive' } }
                ];
            }
            const [leads, total] = await Promise.all([
                config_1.prisma.lead.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        organization: {
                            select: {
                                name: true
                            }
                        },
                        customer: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                config_1.prisma.lead.count({ where })
            ]);
            return api_result_1.ApiResult.success({
                leads,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(total / parsedLimit)
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
                    organization: {
                        select: {
                            name: true
                        }
                    },
                    customer: true,
                    order: true
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
            // Build update data object, including all provided fields
            const updateData = {};
            // Always update fullName and phone if provided (they are required fields)
            if (data.fullName !== undefined && data.fullName !== null) {
                updateData.fullName = String(data.fullName).trim();
            }
            if (data.phone !== undefined && data.phone !== null) {
                updateData.phone = String(data.phone).trim();
            }
            // Include optional fields
            if (data.email !== undefined)
                updateData.email = data.email;
            if (data.vehicleType !== undefined)
                updateData.vehicleType = data.vehicleType;
            if (data.vehicleMake !== undefined)
                updateData.vehicleMake = data.vehicleMake;
            if (data.vehicleModel !== undefined)
                updateData.vehicleModel = data.vehicleModel;
            if (data.vehicleYear !== undefined)
                updateData.vehicleYear = data.vehicleYear;
            if (data.vehicleCondition !== undefined)
                updateData.vehicleCondition = data.vehicleCondition;
            if (data.locationAddress !== undefined)
                updateData.locationAddress = data.locationAddress;
            if (data.latitude !== undefined)
                updateData.latitude = data.latitude;
            if (data.longitude !== undefined)
                updateData.longitude = data.longitude;
            if (data.leadSource !== undefined)
                updateData.leadSource = data.leadSource;
            if (data.photos !== undefined)
                updateData.photos = data.photos;
            if (data.notes !== undefined)
                updateData.notes = data.notes;
            if (data.status !== undefined)
                updateData.status = data.status;
            // Log for debugging
            console.log('Update lead - received data:', data);
            console.log('Update lead - updateData:', updateData);
            const lead = await config_1.prisma.lead.update({
                where: { id },
                data: updateData,
                include: {
                    organization: {
                        select: {
                            name: true
                        }
                    },
                    customer: true
                }
            });
            // Create timeline entry
            await config_1.prisma.leadTimeline.create({
                data: {
                    leadId: id,
                    activity: 'Lead updated',
                    performedBy: 'system'
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
    async convertLeadToOrder(id, data) {
        try {
            const existingLead = await config_1.prisma.lead.findUnique({
                where: { id }
            });
            if (!existingLead) {
                return api_result_1.ApiResult.error("Lead not found", 404);
            }
            if (existingLead.status === enum_1.LeadStatus.CONVERTED) {
                return api_result_1.ApiResult.error("Lead is already converted", 400);
            }
            // Create order from lead
            const order = await config_1.prisma.order.create({
                data: {
                    organizationId: existingLead.organizationId,
                    leadId: id,
                    customerName: existingLead.fullName,
                    customerPhone: existingLead.phone,
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
            await config_1.prisma.lead.update({
                where: { id },
                data: { status: enum_1.LeadStatus.CONVERTED }
            });
            // Create timeline entries
            await config_1.prisma.leadTimeline.create({
                data: {
                    leadId: id,
                    activity: 'Lead converted to order',
                    performedBy: 'system'
                }
            });
            await config_1.prisma.orderTimeline.create({
                data: {
                    orderId: order.id,
                    status: 'PENDING',
                    notes: 'Order created from lead',
                    performedBy: 'system'
                }
            });
            return api_result_1.ApiResult.success(order, "Lead converted to order successfully");
        }
        catch (error) {
            console.log("Error in convertLeadToOrder", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getLeadTimeline(id) {
        try {
            const timeline = await config_1.prisma.leadTimeline.findMany({
                where: { leadId: id },
                orderBy: {
                    createdAt: 'asc'
                }
            });
            return api_result_1.ApiResult.success(timeline, "Lead timeline retrieved successfully");
        }
        catch (error) {
            console.log("Error in getLeadTimeline", error);
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
                new: 0,
                contacted: 0,
                quoted: 0,
                converted: 0,
                rejected: 0
            };
            stats.forEach(stat => {
                statsMap[stat.status.toLowerCase()] = stat._count.status;
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
