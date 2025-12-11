import { Request, Response } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { PickupRequestService } from '../services/pickup-request';
import { 
  createPickupRequestSchema,
  updatePickupRequestSchema,
  pickupRequestQuerySchema,
  pickupRequestIdSchema,
  assignPickupRequestSchema
} from '../rules/pickup-request.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/pickup-requests')
export class PickupRequestController {
  private pickupRequestService: PickupRequestService;

  constructor() {
    this.pickupRequestService = new PickupRequestService();
  }

  @POST('/')
  @Validate([createPickupRequestSchema])
  public async createPickupRequest(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.pickupRequestService.createPickupRequest(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createPickupRequest", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/')
  @Validate([pickupRequestQuerySchema])
  public async getPickupRequests(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.pickupRequestService.getPickupRequests(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getPickupRequests", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([pickupRequestIdSchema])
  public async getPickupRequestById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.pickupRequestService.getPickupRequestById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getPickupRequestById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([pickupRequestIdSchema, updatePickupRequestSchema])
  public async updatePickupRequest(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.pickupRequestService.updatePickupRequest(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updatePickupRequest", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([pickupRequestIdSchema])
  public async deletePickupRequest(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.pickupRequestService.deletePickupRequest(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deletePickupRequest", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @POST('/:id/assign')
  @Validate([pickupRequestIdSchema, assignPickupRequestSchema])
  public async assignPickupRequest(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.pickupRequestService.assignPickupRequest(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in assignPickupRequest", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}
