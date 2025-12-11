"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const bcrypt_1 = __importDefault(require("bcrypt"));
class EmployeeService {
    async createEmployee(data) {
        try {
            const passwordHash = await bcrypt_1.default.hash(data.password, 10);
            const employee = await config_1.prisma.employee.create({
                data: {
                    organizationId: data.organizationId,
                    fullName: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    role: data.role,
                    workZone: data.workZone,
                    passwordHash,
                    profilePhoto: data.profilePhoto,
                    scrapYardId: data.scrapYardId,
                    isActive: true,
                    completedPickups: 0,
                    rating: 0
                },
                include: {
                    organization: true,
                    scrapYard: true
                }
            });
            return api_result_1.ApiResult.success(employee, "Employee created successfully", 201);
        }
        catch (error) {
            console.log("Error in createEmployee", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getEmployees(query) {
        try {
            const { page = 1, limit = 10, search, role, isActive, organizationId, workZone } = query;
            const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const skip = (parsedPage - 1) * parsedLimit;
            const where = {};
            if (organizationId) {
                where.organizationId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
            }
            if (role) {
                where.role = role;
            }
            if (isActive !== undefined) {
                // Convert string to boolean if needed
                if (typeof isActive === 'string') {
                    where.isActive = isActive.toLowerCase() === 'true' || isActive === '1';
                }
                else {
                    where.isActive = Boolean(isActive);
                }
            }
            if (workZone) {
                where.workZone = workZone;
            }
            if (search) {
                where.OR = [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } }
                ];
            }
            const [employees, total] = await Promise.all([
                config_1.prisma.employee.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        organization: true,
                        scrapYard: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                config_1.prisma.employee.count({ where })
            ]);
            return api_result_1.ApiResult.success({
                employees,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(total / parsedLimit)
                }
            }, "Employees retrieved successfully");
        }
        catch (error) {
            console.log("Error in getEmployees", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getEmployeeById(id) {
        try {
            const employee = await config_1.prisma.employee.findUnique({
                where: { id },
                include: {
                    organization: true,
                    scrapYard: true
                }
            });
            if (!employee) {
                return api_result_1.ApiResult.error("Employee not found", 404);
            }
            return api_result_1.ApiResult.success(employee, "Employee retrieved successfully");
        }
        catch (error) {
            console.log("Error in getEmployeeById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateEmployee(id, data) {
        try {
            const existingEmployee = await config_1.prisma.employee.findUnique({
                where: { id }
            });
            if (!existingEmployee) {
                return api_result_1.ApiResult.error("Employee not found", 404);
            }
            const updateData = { ...data };
            if (data.password) {
                updateData.passwordHash = await bcrypt_1.default.hash(data.password, 10);
                delete updateData.password;
            }
            const employee = await config_1.prisma.employee.update({
                where: { id },
                data: updateData,
                include: {
                    organization: true,
                    scrapYard: true
                }
            });
            return api_result_1.ApiResult.success(employee, "Employee updated successfully");
        }
        catch (error) {
            console.log("Error in updateEmployee", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteEmployee(id) {
        try {
            const existingEmployee = await config_1.prisma.employee.findUnique({
                where: { id }
            });
            if (!existingEmployee) {
                return api_result_1.ApiResult.error("Employee not found", 404);
            }
            await config_1.prisma.employee.delete({
                where: { id }
            });
            return api_result_1.ApiResult.success(null, "Employee deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteEmployee", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async activateEmployee(id) {
        try {
            const employee = await config_1.prisma.employee.update({
                where: { id },
                data: { isActive: true },
                include: {
                    organization: true
                }
            });
            return api_result_1.ApiResult.success(employee, "Employee activated successfully");
        }
        catch (error) {
            console.log("Error in activateEmployee", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deactivateEmployee(id) {
        try {
            const employee = await config_1.prisma.employee.update({
                where: { id },
                data: { isActive: false },
                include: {
                    organization: true
                }
            });
            return api_result_1.ApiResult.success(employee, "Employee deactivated successfully");
        }
        catch (error) {
            console.log("Error in deactivateEmployee", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getEmployeePerformance(id) {
        try {
            const employee = await config_1.prisma.employee.findUnique({
                where: { id },
                include: {
                    orders: {
                        where: {
                            orderStatus: 'COMPLETED'
                        }
                    },
                    reviews: true
                }
            });
            if (!employee) {
                return api_result_1.ApiResult.error("Employee not found", 404);
            }
            const totalPickups = employee.completedPickups;
            const completedOrders = employee.orders.length;
            const cancelledOrders = await config_1.prisma.order.count({
                where: {
                    assignedCollectorId: id,
                    orderStatus: 'CANCELLED'
                }
            });
            const totalRevenue = await config_1.prisma.payment.aggregate({
                where: {
                    collectorId: id,
                    status: 'PAID'
                },
                _sum: {
                    amount: true
                }
            });
            const avgRating = employee.reviews.length > 0
                ? employee.reviews.reduce((sum, r) => sum + r.rating, 0) / employee.reviews.length
                : 0;
            return api_result_1.ApiResult.success({
                employeeId: id,
                totalPickups,
                averageRating: avgRating,
                completedOrders,
                cancelledOrders,
                totalRevenue: totalRevenue._sum.amount || 0
            }, "Employee performance retrieved successfully");
        }
        catch (error) {
            console.log("Error in getEmployeePerformance", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.EmployeeService = EmployeeService;
