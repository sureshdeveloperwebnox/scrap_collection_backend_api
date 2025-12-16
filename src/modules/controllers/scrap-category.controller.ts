import { Request, Response } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { ScrapCategoryService } from '../services/scrap-category';
import {
  createScrapCategorySchema,
  updateScrapCategorySchema,
  scrapCategoryQuerySchema,
  scrapCategoryIdSchema,
} from '../rules/scrap-category.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/scrap-categories')
export class ScrapCategoryController {
  private scrapCategoryService: ScrapCategoryService;

  constructor() {
    this.scrapCategoryService = new ScrapCategoryService();
  }

  @POST('/')
  @Validate([createScrapCategorySchema])
  public async createScrapCategory(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.scrapCategoryService.createScrapCategory(req.body);
      result.send(res);
    } catch (error) {
      console.log('Error in createScrapCategory', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/')
  @Validate([scrapCategoryQuerySchema])
  public async getScrapCategories(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.scrapCategoryService.getScrapCategories(req.query as any);
      result.send(res);
    } catch (error) {
      console.log('Error in getScrapCategories', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([scrapCategoryIdSchema])
  public async getScrapCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.scrapCategoryService.getScrapCategoryById(id);
      result.send(res);
    } catch (error) {
      console.log('Error in getScrapCategoryById', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([scrapCategoryIdSchema, updateScrapCategorySchema])
  public async updateScrapCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.scrapCategoryService.updateScrapCategory(id, req.body);
      result.send(res);
    } catch (error) {
      console.log('Error in updateScrapCategory', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([scrapCategoryIdSchema])
  public async deleteScrapCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.scrapCategoryService.deleteScrapCategory(id);
      result.send(res);
    } catch (error) {
      console.log('Error in deleteScrapCategory', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}

