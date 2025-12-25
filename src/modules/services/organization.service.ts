import { prisma } from '../../config/db.config';
import { ApiResult } from '../../utils/api-result';
import { IOrganization, ICreateOrganization, IUpdateOrganization } from '../model/organization.interface';

export class OrganizationService {
    /**
     * Create a new organization
     */
    public async createOrganization(data: ICreateOrganization): Promise<ApiResult> {
        try {
            const organization = await prisma.organization.create({
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

            return ApiResult.success(organization, 'Organization created successfully', 201);
        } catch (error: any) {
            console.error('Error creating Organization:', error);
            return ApiResult.error(error.message || 'Failed to create organization', 500);
        }
    }

    /**
     * Get organization by ID
     */
    public async getOrganizationById(id: number): Promise<ApiResult> {
        try {
            const organization = await prisma.organization.findUnique({
                where: { id },
            });

            if (!organization) {
                return ApiResult.error('Organization not found', 404);
            }

            return ApiResult.success(organization, 'Organization retrieved successfully');
        } catch (error: any) {
            console.error('Error getting Organization:', error);
            return ApiResult.error(error.message || 'Failed to get organization', 500);
        }
    }

    /**
     * Get organization by user ID
     */
    public async getOrganizationByUserId(userId: string): Promise<ApiResult> {
        try {
            const user = await prisma.users.findUnique({
                where: { id: userId },
                include: {
                    Organization: true
                }
            });

            if (!user) {
                return ApiResult.error('User not found', 404);
            }

            if (!user.Organization) {
                return ApiResult.error('Organization not found for this user', 404);
            }

            return ApiResult.success(user.Organization, 'Organization retrieved successfully');
        } catch (error: any) {
            console.error('Error getting organization by user ID:', error);
            return ApiResult.error(error.message || 'Failed to get organization', 500);
        }
    }

    /**
     * Update organization
     */
    public async updateOrganization(id: number, data: IUpdateOrganization): Promise<ApiResult> {
        try {
            const existingOrganization = await prisma.organization.findUnique({
                where: { id }
            });

            if (!existingOrganization) {
                return ApiResult.error('Organization not found', 404);
            }

            const organization = await prisma.organization.update({
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

            return ApiResult.success(organization, 'Organization updated successfully');
        } catch (error: any) {
            console.error('Error updating Organization:', error);
            return ApiResult.error(error.message || 'Failed to update organization', 500);
        }
    }

    /**
     * Link organization to user
     */
    public async linkOrganizationToUser(userId: string, organizationId: number): Promise<ApiResult> {
        try {
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return ApiResult.error('User not found', 404);
            }

            const organization = await prisma.organization.findUnique({
                where: { id: organizationId }
            });

            if (!organization) {
                return ApiResult.error('Organization not found', 404);
            }

            await prisma.users.update({
                where: { id: userId },
                data: { organizationId }
            });

            return ApiResult.success(null, 'Organization linked to user successfully');
        } catch (error: any) {
            console.error('Error linking organization to user:', error);
            return ApiResult.error(error.message || 'Failed to link organization to user', 500);
        }
    }

    /**
     * Delete organization
     */
    public async deleteOrganization(id: number): Promise<ApiResult> {
        try {
            // Check if any users are linked to this organization
            const userCount = await prisma.users.count({
                where: { organizationId: id }
            });

            if (userCount > 0) {
                return ApiResult.error('Cannot delete organization with linked users', 400);
            }

            await prisma.organization.delete({
                where: { id }
            });

            return ApiResult.success(null, 'Organization deleted successfully');
        } catch (error: any) {
            console.error('Error deleting Organization:', error);
            return ApiResult.error(error.message || 'Failed to delete organization', 500);
        }
    }
}
