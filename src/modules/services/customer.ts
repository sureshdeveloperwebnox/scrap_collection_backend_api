import { ICreateCustomerRequest, IUpdateCustomerRequest, ICustomerQueryParams, ICustomerStats } from "../model/customer.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import { CustomerStatus, ScrapCategory, UserRole } from "../model/enum";

export class CustomerService {
  public async createCustomer(data: ICreateCustomerRequest): Promise<ApiResult> {
    try {
      // Check if organization exists
      const organization = await prisma.organization.findUnique({
        where: { id: Number(data.organizationId) }
      });

      if (!organization) {
        return ApiResult.error("Organization not found", 404);
      }
      

      // Check if customer already exists for this email in this organization
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          email: data.email,
          organizationId: Number(data.organizationId)
        }
      });

      if (existingCustomer) {
        return ApiResult.error("Customer already exists for this email in this organization", 400);
      }

      const user = await prisma.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          role: UserRole.CUSTOMER
        }
      });

      const customer = await prisma.customer.create({
        data: {
          organizationId: Number(data.organizationId),
          userId: user.id,
          contact: data.contact,
          email: data.email,
          vehicleTypeId: Number(data.vehicleTypeId),
          scrapCategory: data.scrapCategory as ScrapCategory,
          address: data.address,
          status: data.status as CustomerStatus
        },
        include: {
          organization: {
            select: {
              name: true
            }
          },
          user: {
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
      const { page = 1, limit = 10, search, organizationId, isActive } = query;
      const numericPage = Number(page);
      const numericLimit = Number(limit);
      const skip = (numericPage - 1) * numericLimit;

      const where: any = {};

      if (organizationId) {
        where.organizationId = organizationId;
      }

      if (isActive !== undefined) {
        where.user = {
          isActive: isActive
        };
      }

      if (search) {
        where.OR = [
          {
            user: {
              email: { contains: search, mode: 'insensitive' }
            }
          },
          {
            user: {
              firstName: { contains: search, mode: 'insensitive' }
            }
          },
          {
            user: {
              lastName: { contains: search, mode: 'insensitive' }
            }
          },
          {
            user: {
              phone: { contains: search, mode: 'insensitive' }
            }
          },
          {
            address: { contains: search, mode: 'insensitive' }
          }
        ];
      }

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip,
          take: numericLimit,
          include: {
            organization: {
              select: {
                name: true
              }
            },
            user: {
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
            _count: {
              select: {
                orders: true,
                payments: true,
                reviews: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.customer.count({ where })
      ]);

      const totalPages = Math.ceil(total / numericLimit);

      return ApiResult.success({
        customers,
        pagination: {
          page: numericPage,
          limit: numericLimit,
          total,
          totalPages
        }
      }, "Customers retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCustomers", error);
      return ApiResult.error(error.message);
    }
  }

  public async getCustomerById(id: number): Promise<ApiResult> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          organization: {
            select: {
              name: true
            }
          },
          user: {
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
          orders: {
            include: {
              vehicleType: true,
              employee: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          payments: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          reviews: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          _count: {
            select: {
              orders: true,
              payments: true,
              reviews: true
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

  public async getCustomerByUserId(userId: string): Promise<ApiResult> {
    try {
      const customer = await prisma.customer.findFirst({
        where: { userId },
        include: {
          organization: {
            select: {
              name: true
            }
          },
          user: {
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
          orders: {
            include: {
              vehicleType: true,
              employee: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          payments: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          reviews: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          _count: {
            select: {
              orders: true,
              payments: true,
              reviews: true
            }
          }
        }
      });

      if (!customer) {
        return ApiResult.error("Customer not found", 404);
      }

      return ApiResult.success(customer, "Customer retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCustomerByUserId", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateCustomer(id: number, data: IUpdateCustomerRequest): Promise<ApiResult> {
    try {
      const existingCustomer = await prisma.customer.findUnique({
        where: { id }
      });

      if (!existingCustomer) {
        return ApiResult.error("Customer not found", 404);
      }

      // Prepare update data, excluding the id field
      const updateData: any = {};
      if (data.organizationId) updateData.organizationId = Number(data.organizationId);
      if (data.contact) updateData.contact = data.contact;
      if (data.email) updateData.email = data.email;
      if (data.vehicleTypeId) updateData.vehicleTypeId = Number(data.vehicleTypeId);
      if (data.scrapCategory) updateData.scrapCategory = data.scrapCategory as ScrapCategory;
      if (data.address) updateData.address = data.address;
      if (data.status) updateData.status = data.status as CustomerStatus;

      const customer = await prisma.customer.update({
        where: { id },
        data: updateData,
        include: {
          organization: {
            select: {
              name: true
            }
          },
          user: {
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

  public async deleteCustomer(id: number): Promise<ApiResult> {
    try {
      const existingCustomer = await prisma.customer.findUnique({
        where: { id },
        include: {
          orders: true,
          payments: true,
          reviews: true
        }
      });

      if (!existingCustomer) {
        return ApiResult.error("Customer not found", 404);
      }

      // Check if customer has any orders
      if (existingCustomer.orders.length > 0) {
        return ApiResult.error("Cannot delete customer with existing orders", 400);
      }

      // Check if customer has any payments
      if (existingCustomer.payments.length > 0) {
        return ApiResult.error("Cannot delete customer with existing payments", 400);
      }

      // Check if customer has any reviews
      if (existingCustomer.reviews.length > 0) {
        return ApiResult.error("Cannot delete customer with existing reviews", 400);
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
      const [
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        customersWithOrders,
        customersWithoutOrders
      ] = await Promise.all([
        prisma.customer.count({
          where: { organizationId }
        }),
        prisma.customer.count({
          where: {
            organizationId,
            user: {
              isActive: true
            }
          }
        }),
        prisma.customer.count({
          where: {
            organizationId,
            user: {
              isActive: false
            }
          }
        }),
        prisma.customer.count({
          where: {
            organizationId,
            orders: {
              some: {}
            }
          }
        }),
        prisma.customer.count({
          where: {
            organizationId,
            orders: {
              none: {}
            }
          }
        })
      ]);

      const stats: ICustomerStats = {
        total: totalCustomers,
        active: activeCustomers,
        inactive: inactiveCustomers,
        withOrders: customersWithOrders,
        withoutOrders: customersWithoutOrders
      };

      return ApiResult.success(stats, "Customer statistics retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCustomerStats", error);
      return ApiResult.error(error.message);
    }
  }

  public async getCustomerOrders(id: number): Promise<ApiResult> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
              vehicleType: true,
              employee: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              },
              payment: true,
              review: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!customer) {
        return ApiResult.error("Customer not found", 404);
      }

      return ApiResult.success(customer.orders, "Customer orders retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCustomerOrders", error);
      return ApiResult.error(error.message);
    }
  }

  public async getCustomerPayments(id: number): Promise<ApiResult> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          payments: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!customer) {
        return ApiResult.error("Customer not found", 404);
      }

      return ApiResult.success(customer.payments, "Customer payments retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCustomerPayments", error);
      return ApiResult.error(error.message);
    }
  }

  public async getCustomerReviews(id: number): Promise<ApiResult> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          reviews: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!customer) {
        return ApiResult.error("Customer not found", 404);
      }

      return ApiResult.success(customer.reviews, "Customer reviews retrieved successfully");

    } catch (error: any) {
      console.log("Error in getCustomerReviews", error);
      return ApiResult.error(error.message);
    }
  }
} 