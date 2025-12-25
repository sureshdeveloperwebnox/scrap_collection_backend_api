import { ICreateCustomerRequest, IUpdateCustomerRequest, ICustomerQueryParams } from "../model/customer.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { CustomerStatus } from "../model/enum";

export class CustomerService {
  public async createCustomer(data: ICreateCustomerRequest): Promise<ApiResult> {
    try {
      // Check if organization exists
      const organization = await prisma.organization.findUnique({
        where: { id: data.organizationId }
      });

      if (!organization) {
        return ApiResult.error("Organization not found", 404);
      }

      // Check if customer already exists for this phone in this organization
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          phone: data.phone,
          organizationId: data.organizationId
        }
      });

      if (existingCustomer) {
        return ApiResult.error("Customer already exists for this phone in this organization", 400);
      }

      // Validate accountStatus if provided, otherwise default to ACTIVE
      let accountStatus = CustomerStatus.ACTIVE;
      if (data.accountStatus) {
        const validStatuses = ['ACTIVE', 'INACTIVE', 'VIP', 'BLOCKED'];
        if (validStatuses.includes(data.accountStatus.toUpperCase())) {
          accountStatus = data.accountStatus.toUpperCase() as CustomerStatus;
        }
      }

      const customer = await prisma.customer.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          vehicleType: data.vehicleType,
          vehicleMake: data.vehicleMake,
          vehicleModel: data.vehicleModel,
          vehicleNumber: data.vehicleNumber,
          vehicleYear: data.vehicleYear,
          vehicleCondition: data.vehicleCondition,
          userId: data.userId,
          accountStatus: accountStatus
        },
        include: {
          Organization: {
            select: {
              name: true
            }
          },
          users: {
            select: {
              id: true,
              email: true,
              phone: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true
            }
          }
        }
      });

      return ApiResult.success(customer, "Customer created successfully", 201);

    } catch (error: any) {
      console.log("Error in createCustomer", error);
      return ApiResult.error(error.message);
    }
  }

  public async getCustomers(query: ICustomerQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, organizationId, accountStatus } = query as any;

      const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
      const skip = (parsedPage - 1) * parsedLimit;

      const where: any = {};

      if (organizationId) {
        where.organizationId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
      }

      if (accountStatus) {
        // Validate accountStatus is a valid enum value
        const validStatuses = ['ACTIVE', 'INACTIVE', 'VIP', 'BLOCKED'];
        if (validStatuses.includes(accountStatus.toUpperCase())) {
          where.accountStatus = accountStatus.toUpperCase() as any;
        }
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            Organization: {
              select: {
                name: true
              }
            },
            users: {
              select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.customer.count({ where })
      ]);

      return ApiResult.success({
        customers,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }, "Customers retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCustomers", error);
      return ApiResult.error(error.message);
    }
  }

  public async getCustomerById(id: string): Promise<ApiResult> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          Organization: {
            select: {
              name: true
            }
          },
          users: {
            select: {
              id: true,
              email: true,
              phone: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true
            }
          },
          Order: {
            take: 10,
            orderBy: {
              createdAt: 'desc'
            }
          },
          Payment: {
            take: 10,
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!customer) {
        return ApiResult.error("Customer not found", 404);
      }

      return ApiResult.success(customer, "Customer retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCustomerById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateCustomer(id: string, data: IUpdateCustomerRequest): Promise<ApiResult> {
    try {
      const existingCustomer = await prisma.customer.findUnique({
        where: { id }
      });

      if (!existingCustomer) {
        return ApiResult.error("Customer not found", 404);
      }

      // Remove organizationId from update data as it's a relation field and cannot be updated directly
      const { organizationId, ...updateData } = data as any;
      
      // Validate accountStatus if provided
      if (updateData.accountStatus) {
        const validStatuses = ['ACTIVE', 'INACTIVE', 'VIP', 'BLOCKED'];
        if (!validStatuses.includes(updateData.accountStatus.toUpperCase())) {
          return ApiResult.error(`Invalid accountStatus. Must be one of: ${validStatuses.join(', ')}`, 400);
        }
        updateData.accountStatus = updateData.accountStatus.toUpperCase();
      }

      const customer = await prisma.customer.update({
        where: { id },
        data: updateData,
        include: {
          Organization: {
            select: {
              name: true
            }
          },
          users: {
            select: {
              id: true,
              email: true,
              phone: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true
            }
          }
        }
      });

      return ApiResult.success(customer, "Customer updated successfully");

    } catch (error: any) {
      console.log("Error in updateCustomer", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteCustomer(id: string): Promise<ApiResult> {
    try {
      const existingCustomer = await prisma.customer.findUnique({
        where: { id }
      });

      if (!existingCustomer) {
        return ApiResult.error("Customer not found", 404);
      }

      // Check if customer has orders
      const orderCount = await prisma.order.count({
        where: { customerId: id }
      });

      if (orderCount > 0) {
        return ApiResult.error("Cannot delete customer that has orders. Consider blocking the account instead.", 400);
      }

      await prisma.customer.delete({
        where: { id }
      });

      return ApiResult.success(null, "Customer deleted successfully");

    } catch (error: any) {
      console.log("Error in deleteCustomer", error);
      return ApiResult.error(error.message);
    }
  }

  public async getCustomerStats(organizationId: number): Promise<ApiResult> {
    try {
      const stats = await prisma.customer.groupBy({
        by: ['accountStatus'],
        where: { organizationId },
        _count: {
          accountStatus: true
        }
      });

      const totalCustomers = await prisma.customer.count({
        where: { organizationId }
      });

      const statsMap: any = {
        total: totalCustomers,
        active: 0,
        inactive: 0,
        vip: 0,
        blocked: 0
      };

      stats.forEach(stat => {
        if (stat.accountStatus === CustomerStatus.ACTIVE) {
          statsMap.active = stat._count.accountStatus;
        } else if (stat.accountStatus === CustomerStatus.INACTIVE) {
          statsMap.inactive = stat._count.accountStatus;
        } else if (stat.accountStatus === CustomerStatus.VIP) {
          statsMap.vip = stat._count.accountStatus;
        } else if (stat.accountStatus === CustomerStatus.BLOCKED) {
          statsMap.blocked = stat._count.accountStatus;
        }
      });

      return ApiResult.success(statsMap, "Customer statistics retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCustomerStats", error);
      return ApiResult.error(error.message);
    }
  }
}
