import { Request, Response } from 'express';
import { RequestX } from "../../utils/request.interface";

import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { VehicleTypeService } from '../services/vehicle-type';
import { 
  createVehicleTypeSchema,
  updateVehicleTypeSchema,
  vehicleTypeQuerySchema,
  vehicleTypeIdSchema
} from '../rules/vehicle-type.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/vehicle-types')
export class VehicleTypeController {
  private vehicleTypeService: VehicleTypeService;

  constructor() {
    this.vehicleTypeService = new VehicleTypeService();
  }

  @POST('/')
  @Validate([createVehicleTypeSchema])
  public async createVehicleType(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.vehicleTypeService.createVehicleType(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createVehicleType", error);
      ApiResult.error("Error in createVehicleType", 500).send(res);
    }
  }

  @GET('/')
  @Validate([vehicleTypeQuerySchema])
  public async getVehicleTypes(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.vehicleTypeService.getVehicleTypes(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getVehicleTypes", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([vehicleTypeIdSchema])
  public async getVehicleTypeById(req: RequestX, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.vehicleTypeService.getVehicleTypeById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getVehicleTypeById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([vehicleTypeIdSchema, updateVehicleTypeSchema])
  public async updateVehicleType(req: RequestX, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.vehicleTypeService.updateVehicleType(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updateVehicleType", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([vehicleTypeIdSchema])
  public async deleteVehicleType(req: RequestX, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.vehicleTypeService.deleteVehicleType(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deleteVehicleType", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/stats/:organizationId')
  public async getVehicleTypeStats(req: RequestX, res: Response): Promise<void> {
    try {
      const organizationId = parseInt(req.params.organizationId);
      const result = await this.vehicleTypeService.getVehicleTypeStats(organizationId);
      result.send(res);
    } catch (error) {
      console.log("Error in getVehicleTypeStats", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
} 