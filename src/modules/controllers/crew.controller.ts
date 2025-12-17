
import { Request, Response } from 'express';
import { RequestX } from '../../utils/request.interface';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
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
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const data: CreateCrewDto = req.body;
            const result = await this.crewService.createCrew(data);
            result.send(res);
        } catch (error: any) {
            ApiResult.error(error.message, 500).send(res);
        }
    }

    @GET('/')
    public async getAll(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.crewService.getAllCrews();
            result.send(res);
        } catch (error: any) {
            ApiResult.error(error.message, 500).send(res);
        }
    }

    @GET('/:id')
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
