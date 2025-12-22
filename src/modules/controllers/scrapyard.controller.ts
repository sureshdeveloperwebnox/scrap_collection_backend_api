import { Request, Response } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { ScrapYardService } from '../services/scrapyard';
import {
  createScrapYardSchema,
  updateScrapYardSchema,
  scrapYardQuerySchema,
  scrapYardIdSchema
} from '../rules/scrapyard.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/scrap-yards')
export class ScrapYardController {
  private scrapYardService: ScrapYardService;

  constructor() {
    this.scrapYardService = new ScrapYardService();
  }

  @POST('/')
  @Validate([createScrapYardSchema])
  public async createScrapYard(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.scrapYardService.createScrapYard(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createScrapYard", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/')
  @Validate([scrapYardQuerySchema])
  public async getScrapYards(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.scrapYardService.getScrapYards(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getScrapYards", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/stats')
  public async getScrapYardStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.scrapYardService.getScrapYardStats(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getScrapYardStats", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([scrapYardIdSchema])
  public async getScrapYardById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.scrapYardService.getScrapYardById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getScrapYardById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([scrapYardIdSchema, updateScrapYardSchema])
  public async updateScrapYard(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.scrapYardService.updateScrapYard(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updateScrapYard", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([scrapYardIdSchema])
  public async deleteScrapYard(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.scrapYardService.deleteScrapYard(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deleteScrapYard", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}
