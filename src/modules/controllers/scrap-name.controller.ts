import { Request, Response } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { ScrapNameService } from '../services/scrap-name';
import {
  createScrapNameSchema,
  updateScrapNameSchema,
  scrapNameQuerySchema,
  scrapNameIdSchema,
} from '../rules/scrap-name.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/scrap-names')
export class ScrapNameController {
  private scrapNameService: ScrapNameService;

  constructor() {
    this.scrapNameService = new ScrapNameService();
  }

  @POST('/')
  @Validate([createScrapNameSchema])
  public async createScrapName(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.scrapNameService.createScrapName(req.body);
      result.send(res);
    } catch (error) {
      console.log('Error in createScrapName', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/')
  @Validate([scrapNameQuerySchema])
  public async getScrapNames(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.scrapNameService.getScrapNames(req.query as any);
      result.send(res);
    } catch (error) {
      console.log('Error in getScrapNames', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([scrapNameIdSchema])
  public async getScrapNameById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.scrapNameService.getScrapNameById(id);
      result.send(res);
    } catch (error) {
      console.log('Error in getScrapNameById', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([scrapNameIdSchema, updateScrapNameSchema])
  public async updateScrapName(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.scrapNameService.updateScrapName(id, req.body);
      result.send(res);
    } catch (error) {
      console.log('Error in updateScrapName', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([scrapNameIdSchema])
  public async deleteScrapName(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.scrapNameService.deleteScrapName(id);
      result.send(res);
    } catch (error) {
      console.log('Error in deleteScrapName', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}

