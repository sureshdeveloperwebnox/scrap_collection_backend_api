import { Request, Response } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { ReviewService } from '../services/review';
import { 
  createReviewSchema,
  updateReviewSchema,
  reviewQuerySchema,
  reviewIdSchema
} from '../rules/review.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/reviews')
export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  @POST('/')
  @Validate([createReviewSchema])
  public async createReview(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.reviewService.createReview(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createReview", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/')
  @Validate([reviewQuerySchema])
  public async getReviews(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.reviewService.getReviews(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getReviews", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([reviewIdSchema])
  public async getReviewById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.reviewService.getReviewById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getReviewById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([reviewIdSchema, updateReviewSchema])
  public async updateReview(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.reviewService.updateReview(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updateReview", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}
