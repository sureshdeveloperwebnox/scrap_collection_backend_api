import { RequestX } from '../../utils/request.interface';
import { Controller, GET, POST, PUT, DELETE, Validate } from '../../decorators';
import { Authenticate } from '../../decorators/authenticate.decorator';
import { forCreateOrganization, forUpdateOrganization } from '../rules/organization.rules';
import { OrganizationService } from '../services/organization.service';
import { ApiResult } from '../../utils/api-result';
import { UserCategory } from '../../utils/user-category.enum';

@Controller('/organizations')
export class OrganizationController {
    private organizationService!: OrganizationService;

    @POST('/')
    @Authenticate([UserCategory.ALL])
    @Validate([forCreateOrganization])
    public async createOrganization(req: RequestX): Promise<ApiResult> {
        const userId = req.user?.id;

        if (!userId) {
            return ApiResult.error('Unauthorized', 401);
        }

        // Create organization
        const createResult = await this.getInstance().createOrganization(req.body);

        if (!createResult.success || !createResult.data) {
            return createResult;
        }

        // Link organization to user
        const linkResult = await this.getInstance().linkOrganizationToUser(
            userId,
            createResult.data.id
        );

        if (!linkResult.success) {
            return linkResult;
        }

        return ApiResult.success(
            createResult.data,
            'Organization created and linked successfully',
            201
        );
    }

    @GET('/:id')
    @Authenticate([UserCategory.ALL])
    public async getOrganization(req: RequestX): Promise<ApiResult> {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return ApiResult.error('Invalid organization ID', 400);
        }

        return this.getInstance().getOrganizationById(id);
    }

    @GET('/user/:userId')
    @Authenticate([UserCategory.ALL])
    public async getUserOrganization(req: RequestX): Promise<ApiResult> {
        const userId = req.params.userId;
        const requestingUserId = req.user?.id;

        // Users can only get their own organization unless they're admin
        if (userId !== requestingUserId && req.user?.role !== 'ADMIN') {
            return ApiResult.error('Unauthorized', 403);
        }

        return this.getInstance().getOrganizationByUserId(userId);
    }

    @GET('/me/organization')
    @Authenticate([UserCategory.ALL])
    public async getMyOrganization(req: RequestX): Promise<ApiResult> {
        const userId = req.user?.id;

        if (!userId) {
            return ApiResult.error('Unauthorized', 401);
        }

        return this.getInstance().getOrganizationByUserId(userId);
    }

    @PUT('/:id')
    @Authenticate([UserCategory.ALL])
    @Validate([forUpdateOrganization])
    public async updateOrganization(req: RequestX): Promise<ApiResult> {
        const id = parseInt(req.params.id);
        const userId = req.user?.id;

        if (isNaN(id)) {
            return ApiResult.error('Invalid organization ID', 400);
        }

        if (!userId) {
            return ApiResult.error('Unauthorized', 401);
        }

        // Verify user belongs to this organization
        const orgResult = await this.getInstance().getOrganizationByUserId(userId);

        if (!orgResult.success || !orgResult.data || orgResult.data.id !== id) {
            return ApiResult.error('Unauthorized to update this organization', 403);
        }

        return this.getInstance().updateOrganization(id, req.body);
    }

    @DELETE('/:id')
    @Authenticate([UserCategory.Admin])
    public async deleteOrganization(req: RequestX): Promise<ApiResult> {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return ApiResult.error('Invalid organization ID', 400);
        }

        return this.getInstance().deleteOrganization(id);
    }

    private getInstance(): OrganizationService {
        if (!this.organizationService) {
            this.organizationService = new OrganizationService();
        }
        return this.organizationService;
    }
}
