
import { Request, Response } from 'express';
import { RequestX } from '../../utils/request.interface';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Authenticate } from '../../decorators/authenticate.decorator';
import { UserCategory } from '../../utils/user-category.enum';
import { CrewService } from '../services/crew';
import { ApiResult } from '../../utils/api-result';
import { CreateCrewDto, UpdateCrewDto } from '../model/crew.interface';

@Controller('/crews')
export class CrewController {
    private crewService: CrewService;

    constructor() {
        this.crewService = new CrewService();
    }

    @POST('/')
    @Authenticate([UserCategory.ALL])
    public async create(req: Request, res: Response): Promise<void> {
        try {
            // SECURITY: Extract organizationId from authenticated user
            const userOrganizationId = (req as any).user?.organizationId
                ? parseInt((req as any).user.organizationId)
                : undefined;

            if (!userOrganizationId) {
                ApiResult.error("Organization ID not found", 400).send(res);
                return;
            }

            const data: CreateCrewDto = {
                ...req.body,
                organizationId: userOrganizationId
            };
            const result = await this.crewService.createCrew(data);
            result.send(res);
        } catch (error: any) {
            ApiResult.error(error.message, 500).send(res);
        }
    }

    @GET('/')
    @Authenticate([UserCategory.ALL])
    public async getAll(req: Request, res: Response): Promise<void> {
        try {
            // SECURITY: Extract organizationId from authenticated user
            const userOrganizationId = (req as any).user?.organizationId
                ? parseInt((req as any).user.organizationId)
                : undefined;

            if (!userOrganizationId) {
                ApiResult.error("Organization ID not found", 400).send(res);
                return;
            }

            const result = await this.crewService.getAllCrews(userOrganizationId);
            result.send(res);
        } catch (error: any) {
            ApiResult.error(error.message, 500).send(res);
        }
    }

    @GET('/:id')
    @Authenticate([UserCategory.ALL])
    public async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this.crewService.getCrewById(id);
            result.send(res);
        } catch (error: any) {
            ApiResult.error(error.message, 500).send(res);
        }
    }

    @PUT('/:id')
    @Authenticate([UserCategory.ALL])
    public async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const data: UpdateCrewDto = req.body;
            const result = await this.crewService.updateCrew(id, data);
            result.send(res);
        } catch (error: any) {
            ApiResult.error(error.message, 500).send(res);
        }
    }

    @DELETE('/:id')
    @Authenticate([UserCategory.ALL])
    public async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this.crewService.deleteCrew(id);
            result.send(res);
        } catch (error: any) {
            ApiResult.error(error.message, 500).send(res);
        }
    }
}
