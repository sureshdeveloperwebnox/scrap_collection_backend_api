"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const enum_1 = require("../model/enum");
const cache_1 = require("../../utils/cache");
const storage_service_1 = require("../../utils/storage.service");
class LeadService {
    /**
     * Normalize photo paths - convert full URLs to relative paths
     */
    normalizePhotoPaths(photos) {
        if (!photos || !Array.isArray(photos))
            return [];
        return photos.map(photo => storage_service_1.storageService.getRelativePath(photo));
    }
    async createLead(data) {
        try {
            // Normalize photo paths before saving
            const normalizedPhotos = this.normalizePhotoPaths(data.photos);
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
                    photos: normalizedPhotos,
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
            // Invalidate leads cache and stats cache
            cache_1.cacheService.deletePattern('^leads:');
            cache_1.cacheService.deletePattern('^lead-stats:');
            return api_result_1.ApiResult.success(lead, "Lead created successfully", 201);
        }
        catch (error) {
            console.log("Error in createLead", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getLeads(query) {
        try {
            const { page = 1, limit = 10, search, status, vehicleType, vehicleCondition, leadSource, organizationId, dateFrom, dateTo, sortBy, sortOrder } = query;
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
            if (vehicleCondition) {
                where.vehicleCondition = vehicleCondition;
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
            // Build orderBy clause for optimized sorting
            const orderBy = {};
            if (sortBy) {
                const validSortFields = ['fullName', 'phone', 'email', 'status', 'createdAt', 'updatedAt'];
                if (validSortFields.includes(sortBy)) {
                    orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
                }
                else {
                    orderBy.createdAt = 'desc'; // Default fallback
                }
            }
            else {
                orderBy.createdAt = 'desc'; // Default sorting
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
                    orderBy
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
            if (data.photos !== undefined) {
                // Normalize photo paths before saving
                updateData.photos = this.normalizePhotoPaths(data.photos);
            }
            if (data.notes !== undefined)
                updateData.notes = data.notes;
            if (data.status !== undefined)
                updateData.status = data.status;
            // Log for debugging
            console.log('Update lead - received data:', JSON.stringify(data, null, 2));
            console.log('Update lead - updateData:', JSON.stringify(updateData, null, 2));
            // Ensure we have at least one field to update
            if (Object.keys(updateData).length === 0) {
                return api_result_1.ApiResult.error("No fields provided for update", 400);
            }
            // Ensure fullName and phone are present if they're being updated
            if (updateData.fullName === undefined && updateData.phone === undefined) {
                console.warn('Warning: Neither fullName nor phone provided in update');
            }
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
            console.log('Update lead - updated lead:', lead);
            // Create timeline entry
            await config_1.prisma.leadTimeline.create({
                data: {
                    leadId: id,
                    activity: 'Lead updated',
                    performedBy: 'system'
                }
            });
            // Invalidate leads cache and stats cache
            cache_1.cacheService.deletePattern('^leads:');
            cache_1.cacheService.deletePattern('^lead-stats:');
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
            // Invalidate leads cache and stats cache
            cache_1.cacheService.deletePattern('^leads:');
            cache_1.cacheService.deletePattern('^lead-stats:');
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
            // Invalidate leads cache and stats cache
            cache_1.cacheService.deletePattern('^leads:');
            cache_1.cacheService.deletePattern('^lead-stats:');
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
            // Build cache key for stats
            const cacheKey = cache_1.cacheService.generateKey('lead-stats', { organizationId });
            // Try to get from cache
            const cachedResult = cache_1.cacheService.get(cacheKey);
            if (cachedResult) {
                return api_result_1.ApiResult.success(cachedResult, "Lead statistics retrieved successfully (cached)");
            }
            // Fetch stats from database
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
            // Cache the result for 2 minutes (stats change frequently)
            cache_1.cacheService.set(cacheKey, statsMap, 2 * 60 * 1000);
            return api_result_1.ApiResult.success(statsMap, "Lead statistics retrieved successfully");
        }
        catch (error) {
            console.log("Error in getLeadStats", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.LeadService = LeadService;
