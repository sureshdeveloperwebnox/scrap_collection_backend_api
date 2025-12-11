import { ICreatePickupRequestRequest, IUpdatePickupRequestRequest, IPickupRequestQueryParams, IAssignPickupRequestRequest } from "../model/pickup-request.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { PickupRequestStatus } from "../model/enum";

export class PickupRequestService {
  public async createPickupRequest(data: ICreatePickupRequestRequest): Promise<ApiResult> {
    try {
      const pickupRequest = await prisma.pickupRequest.create({
        data: {
          customerId: data.customerId,
          vehicleDetails: data.vehicleDetails,
          pickupAddress: data.pickupAddress,
          latitude: data.latitude,
          longitude: data.longitude,
          organizationId: data.organizationId,
          status: PickupRequestStatus.PENDING
        },
        include: {
          customer: true,
          assignedCollector: true
        }
      });

      return ApiResult.success(pickupRequest, "Pickup request created successfully", 201);
    } catch (error: any) {
      console.log("Error in createPickupRequest", error);
      return ApiResult.error(error.message);
    }
  }

  public async getPickupRequests(query: IPickupRequestQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, status, assignedTo, customerId, organizationId } = query as any;

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
        prisma.pickupRequest.findMany({
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
        prisma.pickupRequest.count({ where })
      ]);

      return ApiResult.success({
        pickupRequests,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }, "Pickup requests retrieved successfully");
    } catch (error: any) {
      console.log("Error in getPickupRequests", error);
      return ApiResult.error(error.message);
    }
  }

  public async getPickupRequestById(id: string): Promise<ApiResult> {
    try {
      const pickupRequest = await prisma.pickupRequest.findUnique({
        where: { id },
        include: {
          customer: true,
          assignedCollector: true,
          order: true
        }
      });

      if (!pickupRequest) {
        return ApiResult.error("Pickup request not found", 404);
      }

      return ApiResult.success(pickupRequest, "Pickup request retrieved successfully");
    } catch (error: any) {
      console.log("Error in getPickupRequestById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updatePickupRequest(id: string, data: IUpdatePickupRequestRequest): Promise<ApiResult> {
    try {
      const pickupRequest = await prisma.pickupRequest.update({
        where: { id },
        data,
        include: {
          customer: true,
          assignedCollector: true
        }
      });

      return ApiResult.success(pickupRequest, "Pickup request updated successfully");
    } catch (error: any) {
      console.log("Error in updatePickupRequest", error);
      return ApiResult.error(error.message);
    }
  }

  public async deletePickupRequest(id: string): Promise<ApiResult> {
    try {
      await prisma.pickupRequest.delete({
        where: { id }
      });

      return ApiResult.success(null, "Pickup request deleted successfully");
    } catch (error: any) {
      console.log("Error in deletePickupRequest", error);
      return ApiResult.error(error.message);
    }
  }

  public async assignPickupRequest(id: string, data: IAssignPickupRequestRequest): Promise<ApiResult> {
    try {
      const pickupRequest = await prisma.pickupRequest.update({
        where: { id },
        data: {
          assignedTo: data.collectorId,
          status: PickupRequestStatus.ASSIGNED
        },
        include: {
          assignedCollector: true,
          customer: true
        }
      });

      return ApiResult.success(pickupRequest, "Pickup request assigned successfully");
    } catch (error: any) {
      console.log("Error in assignPickupRequest", error);
      return ApiResult.error(error.message);
    }
  }
}
