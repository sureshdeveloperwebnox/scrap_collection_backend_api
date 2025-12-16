import { Request, Response } from 'express';
import { RequestX } from "../../utils/request.interface";

import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { VehicleNameService } from '../services/vehicle-name';
import {
  createVehicleNameSchema,
  updateVehicleNameSchema,
  vehicleNameQuerySchema,
  vehicleNameIdSchema
} from '../rules/vehicle-name.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/vehicle-names')
export class VehicleNameController {
  private vehicleNameService: VehicleNameService;

  constructor() {
    this.vehicleNameService = new VehicleNameService();
  }

  @POST('/')
  @Validate([createVehicleNameSchema])
  public async createVehicleName(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.vehicleNameService.createVehicleName(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createVehicleName", error);
      ApiResult.error("Error in createVehicleName", 500).send(res);
    }
  }

  @GET('/')
  @Validate([vehicleNameQuerySchema])
  public async getVehicleNames(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.vehicleNameService.getVehicleNames(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getVehicleNames", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([vehicleNameIdSchema])
  public async getVehicleNameById(req: RequestX, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.vehicleNameService.getVehicleNameById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getVehicleNameById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([vehicleNameIdSchema, updateVehicleNameSchema])
  public async updateVehicleName(req: RequestX, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.vehicleNameService.updateVehicleName(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updateVehicleName", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([vehicleNameIdSchema])
  public async deleteVehicleName(req: RequestX, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.vehicleNameService.deleteVehicleName(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deleteVehicleName", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
  @GET('/stats/:organizationId')
  public async getVehicleNameStats(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = parseInt(req.params.organizationId);
      if (isNaN(organizationId)) {
        ApiResult.error("Invalid organization ID", 400).send(res);
        return;
      }
      const result = await this.vehicleNameService.getVehicleNameStats(organizationId);
      result.send(res);
    } catch (error) {
      console.log("Error in getVehicleNameStats", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}
