import { ICreateReviewRequest, IUpdateReviewRequest, IReviewQueryParams } from "../model/review.interface";
import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";

export class ReviewService {
  public async createReview(data: ICreateReviewRequest): Promise<ApiResult> {
    try {
      const review = await prisma.review.create({
        data: {
          orderId: data.orderId,
          customerId: data.customerId,
          collectorId: data.collectorId,
          rating: data.rating,
          comment: data.comment,
          organizationId: data.organizationId
        },
        include: {
          order: true,
          customer: true,
          collector: true
        }
      });

      // Update collector rating
      const collectorReviews = await prisma.review.findMany({
        where: { collectorId: data.collectorId }
      });

      const avgRating = collectorReviews.reduce((sum, r) => sum + r.rating, 0) / collectorReviews.length;

      await prisma.employee.update({
        where: { id: data.collectorId },
        data: { rating: avgRating }
      });

      return ApiResult.success(review, "Review created successfully", 201);
    } catch (error: any) {
      console.log("Error in createReview", error);
      return ApiResult.error(error.message);
    }
  }

  public async getReviews(query: IReviewQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, collectorId, customerId, minRating, organizationId } = query as any;

      const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
      const skip = (parsedPage - 1) * parsedLimit;

      const where: any = {};

      if (organizationId) {
        where.organizationId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;
      }

      if (collectorId) {
        where.collectorId = collectorId;
      }

      if (customerId) {
        where.customerId = customerId;
      }

      if (minRating) {
        where.rating = { gte: minRating };
      }

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            order: true,
            customer: true,
            collector: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.review.count({ where })
      ]);

      return ApiResult.success({
        reviews,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }, "Reviews retrieved successfully");
    } catch (error: any) {
      console.log("Error in getReviews", error);
      return ApiResult.error(error.message);
    }
  }

  public async getReviewById(id: string): Promise<ApiResult> {
    try {
      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          order: true,
          customer: true,
          collector: true
        }
      });

      if (!review) {
        return ApiResult.error("Review not found", 404);
      }

      return ApiResult.success(review, "Review retrieved successfully");
    } catch (error: any) {
      console.log("Error in getReviewById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateReview(id: string, data: IUpdateReviewRequest): Promise<ApiResult> {
    try {
      const review = await prisma.review.update({
        where: { id },
        data,
        include: {
          order: true,
          customer: true,
          collector: true
        }
      });

      // Recalculate collector rating
      const collectorReviews = await prisma.review.findMany({
        where: { collectorId: review.collectorId }
      });

      const avgRating = collectorReviews.reduce((sum, r) => sum + r.rating, 0) / collectorReviews.length;

      await prisma.employee.update({
        where: { id: review.collectorId },
        data: { rating: avgRating }
      });

      return ApiResult.success(review, "Review updated successfully");
    } catch (error: any) {
      console.log("Error in updateReview", error);
      return ApiResult.error(error.message);
    }
  }
}
