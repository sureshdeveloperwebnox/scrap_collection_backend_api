"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const enum_1 = require("../model/enum");
class CustomerService {
    async createCustomer(data) {
        try {
            // Check if organization exists
            const organization = await config_1.prisma.organization.findUnique({
                where: { id: data.organizationId }
            });
            if (!organization) {
                return api_result_1.ApiResult.error("Organization not found", 404);
            }
            // Check if customer already exists for this phone in this organization
            const existingCustomer = await config_1.prisma.customer.findFirst({
                where: {
                    phone: data.phone,
                    organizationId: data.organizationId
                }
            });
            if (existingCustomer) {
                return api_result_1.ApiResult.error("Customer already exists for this phone in this organization", 400);
            }
            const customer = await config_1.prisma.customer.create({
                data: {
                    organizationId: data.organizationId,
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    address: data.address,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    userId: data.userId,
                    accountStatus: enum_1.CustomerStatus.ACTIVE
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
            return api_result_1.ApiResult.success(customer, "Customer created successfully", 201);
        }
        catch (error) {
            console.log("Error in createCustomer", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getCustomers(query) {
        try {
            const { page = 1, limit = 10, search, organizationId, accountStatus } = query;
            const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const skip = (parsedPage - 1) * parsedLimit;
            const where = {};
            if (organizationId) {
                where.organizationId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
            }
            if (accountStatus) {
                where.accountStatus = accountStatus;
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
                config_1.prisma.customer.findMany({
                    where,
                    skip,
                    take: parsedLimit,
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
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                config_1.prisma.customer.count({ where })
            ]);
            return api_result_1.ApiResult.success({
                customers,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(total / parsedLimit)
                }
            }, "Customers retrieved successfully");
        }
        catch (error) {
            console.log("Error in getCustomers", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getCustomerById(id) {
        try {
            const customer = await config_1.prisma.customer.findUnique({
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
                        take: 10,
                        orderBy: {
                            createdAt: 'desc'
                        }
                    },
                    payments: {
                        take: 10,
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                }
            });
            if (!customer) {
                return api_result_1.ApiResult.error("Customer not found", 404);
            }
            return api_result_1.ApiResult.success(customer, "Customer retrieved successfully");
        }
        catch (error) {
            console.log("Error in getCustomerById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateCustomer(id, data) {
        try {
            const existingCustomer = await config_1.prisma.customer.findUnique({
                where: { id }
            });
            if (!existingCustomer) {
                return api_result_1.ApiResult.error("Customer not found", 404);
            }
            const customer = await config_1.prisma.customer.update({
                where: { id },
                data,
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
            return api_result_1.ApiResult.success(customer, "Customer updated successfully");
        }
        catch (error) {
            console.log("Error in updateCustomer", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteCustomer(id) {
        try {
            const existingCustomer = await config_1.prisma.customer.findUnique({
                where: { id }
            });
            if (!existingCustomer) {
                return api_result_1.ApiResult.error("Customer not found", 404);
            }
            // Check if customer has orders
            const orderCount = await config_1.prisma.order.count({
                where: { customerId: id }
            });
            if (orderCount > 0) {
                return api_result_1.ApiResult.error("Cannot delete customer that has orders. Consider blocking the account instead.", 400);
            }
            await config_1.prisma.customer.delete({
                where: { id }
            });
            return api_result_1.ApiResult.success(null, "Customer deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteCustomer", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getCustomerStats(organizationId) {
        try {
            const stats = await config_1.prisma.customer.groupBy({
                by: ['accountStatus'],
                where: { organizationId },
                _count: {
                    accountStatus: true
                }
            });
            const totalCustomers = await config_1.prisma.customer.count({
                where: { organizationId }
            });
            const statsMap = {
                total: totalCustomers,
                active: 0,
                blocked: 0
            };
            stats.forEach(stat => {
                if (stat.accountStatus === enum_1.CustomerStatus.ACTIVE) {
                    statsMap.active = stat._count.accountStatus;
                }
                else if (stat.accountStatus === enum_1.CustomerStatus.BLOCKED) {
                    statsMap.blocked = stat._count.accountStatus;
                }
            });
            return api_result_1.ApiResult.success(statsMap, "Customer statistics retrieved successfully");
        }
        catch (error) {
            console.log("Error in getCustomerStats", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.CustomerService = CustomerService;
