"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const db_config_1 = require("../../config/db.config");
const api_result_1 = require("../../utils/api-result");
class OrganizationService {
    /**
     * Create a new organization
     */
    async createOrganization(data) {
        try {
            const organization = await db_config_1.prisma.organization.create({
                data: {
                    name: data.name,
                    email: data.email,
                    website: data.website,
                    billingAddress: data.billingAddress,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    countryId: data.countryId,
                },
            });
            return api_result_1.ApiResult.success(organization, 'Organization created successfully', 201);
        }
        catch (error) {
            console.error('Error creating Organization:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to create organization', 500);
        }
    }
    /**
     * Get organization by ID
     */
    async getOrganizationById(id) {
        try {
            const organization = await db_config_1.prisma.organization.findUnique({
                where: { id },
            });
            if (!organization) {
                return api_result_1.ApiResult.error('Organization not found', 404);
            }
            return api_result_1.ApiResult.success(organization, 'Organization retrieved successfully');
        }
        catch (error) {
            console.error('Error getting Organization:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to get organization', 500);
        }
    }
    /**
     * Get organization by user ID
     */
    async getOrganizationByUserId(userId) {
        try {
            const user = await db_config_1.prisma.users.findUnique({
                where: { id: userId },
                include: {
                    Organization: true
                }
            });
            if (!user) {
                return api_result_1.ApiResult.error('User not found', 404);
            }
            if (!user.Organization) {
                return api_result_1.ApiResult.error('Organization not found for this user', 404);
            }
            return api_result_1.ApiResult.success(user.Organization, 'Organization retrieved successfully');
        }
        catch (error) {
            console.error('Error getting organization by user ID:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to get organization', 500);
        }
    }
    /**
     * Update organization
     */
    async updateOrganization(id, data) {
        try {
            const existingOrganization = await db_config_1.prisma.organization.findUnique({
                where: { id }
            });
            if (!existingOrganization) {
                return api_result_1.ApiResult.error('Organization not found', 404);
            }
            const organization = await db_config_1.prisma.organization.update({
                where: { id },
                data: {
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.email !== undefined && { email: data.email }),
                    ...(data.website !== undefined && { website: data.website }),
                    ...(data.billingAddress !== undefined && { billingAddress: data.billingAddress }),
                    ...(data.latitude !== undefined && { latitude: data.latitude }),
                    ...(data.longitude !== undefined && { longitude: data.longitude }),
                    ...(data.countryId !== undefined && { countryId: data.countryId }),
                },
            });
            return api_result_1.ApiResult.success(organization, 'Organization updated successfully');
        }
        catch (error) {
            console.error('Error updating Organization:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to update organization', 500);
        }
    }
    /**
     * Link organization to user
     */
    async linkOrganizationToUser(userId, organizationId) {
        try {
            const user = await db_config_1.prisma.users.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return api_result_1.ApiResult.error('User not found', 404);
            }
            const organization = await db_config_1.prisma.organization.findUnique({
                where: { id: organizationId }
            });
            if (!organization) {
                return api_result_1.ApiResult.error('Organization not found', 404);
            }
            await db_config_1.prisma.users.update({
                where: { id: userId },
                data: { organizationId }
            });
            return api_result_1.ApiResult.success(null, 'Organization linked to user successfully');
        }
        catch (error) {
            console.error('Error linking organization to user:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to link organization to user', 500);
        }
    }
    /**
     * Delete organization
     */
    async deleteOrganization(id) {
        try {
            // Check if any users are linked to this organization
            const userCount = await db_config_1.prisma.users.count({
                where: { organizationId: id }
            });
            if (userCount > 0) {
                return api_result_1.ApiResult.error('Cannot delete organization with linked users', 400);
            }
            await db_config_1.prisma.organization.delete({
                where: { id }
            });
            return api_result_1.ApiResult.success(null, 'Organization deleted successfully');
        }
        catch (error) {
            console.error('Error deleting Organization:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to delete organization', 500);
        }
    }
}
exports.OrganizationService = OrganizationService;
