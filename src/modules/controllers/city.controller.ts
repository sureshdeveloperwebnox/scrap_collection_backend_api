import { Request, Response } from 'express';
import { RequestX } from "../../utils/request.interface";

import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { CityService } from '../services/city';
import { 
  createCitySchema,
  updateCitySchema,
  cityQuerySchema,
  cityIdSchema
} from '../rules/city.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/cities')
export class CityController {
  private cityService: CityService;

  constructor() {
    this.cityService = new CityService();
  }

  @POST('/')
  @Validate([createCitySchema])
  public async createCity(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.cityService.createCity(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createCity", error);
      ApiResult.error("Error in createCity", 500).send(res);
    }
  }

  @GET('/')
  @Validate([cityQuerySchema])
  public async getCities(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.cityService.getCities(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getCities", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([cityIdSchema])
  public async getCityById(req: RequestX, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.cityService.getCityById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getCityById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([cityIdSchema, updateCitySchema])
  public async updateCity(req: RequestX, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.cityService.updateCity(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updateCity", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([cityIdSchema])
  public async deleteCity(req: RequestX, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.cityService.deleteCity(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deleteCity", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}

