import Joi from 'joi';

export const createReviewSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  customerId: Joi.string().uuid().required(),
  collectorId: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().optional(),
  organizationId: Joi.number().integer().positive().required()
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  comment: Joi.string().optional()
});

export const reviewQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  collectorId: Joi.string().uuid().optional(),
  customerId: Joi.string().uuid().optional(),
  minRating: Joi.number().integer().min(1).max(5).optional(),
  organizationId: Joi.number().integer().positive().optional()
});

export const reviewIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});
