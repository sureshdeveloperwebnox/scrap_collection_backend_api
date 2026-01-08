"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
class ReviewService {
    async createReview(data) {
        try {
            const review = await config_1.prisma.review.create({
                data: {
                    orderId: data.orderId,
                    customerId: data.customerId,
                    collectorId: data.collectorId,
                    rating: data.rating,
                    comment: data.comment,
                    organizationId: data.organizationId
                },
                include: {
                    Order: true,
                    Customer: true,
                    Employee: true
                }
            });
            // Update collector rating
            const collectorReviews = await config_1.prisma.review.findMany({
                where: { collectorId: data.collectorId }
            });
            const avgRating = collectorReviews.reduce((sum, r) => sum + r.rating, 0) / collectorReviews.length;
            await config_1.prisma.employee.update({
                where: { id: data.collectorId },
                data: { rating: avgRating }
            });
            return api_result_1.ApiResult.success(review, "Review created successfully", 201);
        }
        catch (error) {
            console.log("Error in createReview", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getReviews(query) {
        try {
            const { page = 1, limit = 10, collectorId, customerId, minRating, organizationId } = query;
            const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const skip = (parsedPage - 1) * parsedLimit;
            const where = {};
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
                config_1.prisma.review.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        Order: true,
                        Customer: true,
                        Employee: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                config_1.prisma.review.count({ where })
            ]);
            return api_result_1.ApiResult.success({
                reviews,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(total / parsedLimit)
                }
            }, "Reviews retrieved successfully");
        }
        catch (error) {
            console.log("Error in getReviews", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getReviewById(id) {
        try {
            const review = await config_1.prisma.review.findUnique({
                where: { id },
                include: {
                    Order: true,
                    Customer: true,
                    Employee: true
                }
            });
            if (!review) {
                return api_result_1.ApiResult.error("Review not found", 404);
            }
            return api_result_1.ApiResult.success(review, "Review retrieved successfully");
        }
        catch (error) {
            console.log("Error in getReviewById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateReview(id, data) {
        try {
            const review = await config_1.prisma.review.update({
                where: { id },
                data,
                include: {
                    Order: true,
                    Customer: true,
                    Employee: true
                }
            });
            // Recalculate collector rating
            const collectorReviews = await config_1.prisma.review.findMany({
                where: { collectorId: review.collectorId }
            });
            const avgRating = collectorReviews.reduce((sum, r) => sum + r.rating, 0) / collectorReviews.length;
            await config_1.prisma.employee.update({
                where: { id: review.collectorId },
                data: { rating: avgRating }
            });
            return api_result_1.ApiResult.success(review, "Review updated successfully");
        }
        catch (error) {
            console.log("Error in updateReview", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.ReviewService = ReviewService;
