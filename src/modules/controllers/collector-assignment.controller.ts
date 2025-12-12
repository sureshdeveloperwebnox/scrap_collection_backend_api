import { Request, Response } from 'express';
import { RequestX } from "../../utils/request.interface";

import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { CollectorAssignmentService } from '../services/collector-assignment';
import { 
  createCollectorAssignmentSchema,
  updateCollectorAssignmentSchema,
  collectorAssignmentQuerySchema,
  collectorAssignmentIdSchema
} from '../rules/collector-assignment.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/collector-assignments')
export class CollectorAssignmentController {
  private collectorAssignmentService: CollectorAssignmentService;

  constructor() {
    this.collectorAssignmentService = new CollectorAssignmentService();
  }

  @POST('/')
  @Validate([createCollectorAssignmentSchema])
  public async createCollectorAssignment(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.collectorAssignmentService.createCollectorAssignment(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createCollectorAssignment", error);
      ApiResult.error("Error in createCollectorAssignment", 500).send(res);
    }
  }

  @GET('/')
  @Validate([collectorAssignmentQuerySchema])
  public async getCollectorAssignments(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.collectorAssignmentService.getCollectorAssignments(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getCollectorAssignments", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([collectorAssignmentIdSchema])
  public async getCollectorAssignmentById(req: RequestX, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.collectorAssignmentService.getCollectorAssignmentById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getCollectorAssignmentById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([collectorAssignmentIdSchema, updateCollectorAssignmentSchema])
  public async updateCollectorAssignment(req: RequestX, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.collectorAssignmentService.updateCollectorAssignment(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updateCollectorAssignment", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([collectorAssignmentIdSchema])
  public async deleteCollectorAssignment(req: RequestX, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.collectorAssignmentService.deleteCollectorAssignment(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deleteCollectorAssignment", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}
