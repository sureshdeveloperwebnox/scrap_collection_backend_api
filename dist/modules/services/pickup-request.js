"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupRequestService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const enum_1 = require("../model/enum");
class PickupRequestService {
    async createPickupRequest(data) {
        try {
            const pickupRequest = await config_1.prisma.pickupRequest.create({
                data: {
                    customerId: data.customerId,
                    vehicleDetails: data.vehicleDetails,
                    pickupAddress: data.pickupAddress,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    organizationId: data.organizationId,
                    status: enum_1.PickupRequestStatus.PENDING
                },
                include: {
                    customer: true,
                    assignedCollector: true
                }
            });
            return api_result_1.ApiResult.success(pickupRequest, "Pickup request created successfully", 201);
        }
        catch (error) {
            console.log("Error in createPickupRequest", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getPickupRequests(query) {
        try {
            const { page = 1, limit = 10, search, status, assignedTo, customerId, organizationId } = query;
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
            if (assignedTo) {
                where.assignedTo = assignedTo;
            }
            if (customerId) {
                where.customerId = customerId;
            }
            if (search) {
                where.OR = [
                    { pickupAddress: { contains: search, mode: 'insensitive' } }
                ];
            }
            const [pickupRequests, total] = await Promise.all([
                config_1.prisma.pickupRequest.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        customer: true,
                        assignedCollector: true,
                        order: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                config_1.prisma.pickupRequest.count({ where })
            ]);
            return api_result_1.ApiResult.success({
                pickupRequests,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(total / parsedLimit)
                }
            }, "Pickup requests retrieved successfully");
        }
        catch (error) {
            console.log("Error in getPickupRequests", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getPickupRequestById(id) {
        try {
            const pickupRequest = await config_1.prisma.pickupRequest.findUnique({
                where: { id },
                include: {
                    customer: true,
                    assignedCollector: true,
                    order: true
                }
            });
            if (!pickupRequest) {
                return api_result_1.ApiResult.error("Pickup request not found", 404);
            }
            return api_result_1.ApiResult.success(pickupRequest, "Pickup request retrieved successfully");
        }
        catch (error) {
            console.log("Error in getPickupRequestById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updatePickupRequest(id, data) {
        try {
            const pickupRequest = await config_1.prisma.pickupRequest.update({
                where: { id },
                data,
                include: {
                    customer: true,
                    assignedCollector: true
                }
            });
            return api_result_1.ApiResult.success(pickupRequest, "Pickup request updated successfully");
        }
        catch (error) {
            console.log("Error in updatePickupRequest", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deletePickupRequest(id) {
        try {
            await config_1.prisma.pickupRequest.delete({
                where: { id }
            });
            return api_result_1.ApiResult.success(null, "Pickup request deleted successfully");
        }
        catch (error) {
            console.log("Error in deletePickupRequest", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async assignPickupRequest(id, data) {
        try {
            const pickupRequest = await config_1.prisma.pickupRequest.update({
                where: { id },
                data: {
                    assignedTo: data.collectorId,
                    status: enum_1.PickupRequestStatus.ASSIGNED
                },
                include: {
                    assignedCollector: true,
                    customer: true
                }
            });
            return api_result_1.ApiResult.success(pickupRequest, "Pickup request assigned successfully");
        }
        catch (error) {
            console.log("Error in assignPickupRequest", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.PickupRequestService = PickupRequestService;
