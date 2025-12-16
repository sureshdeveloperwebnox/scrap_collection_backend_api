import Joi from 'joi';

export const createScrapCategorySchema = Joi.object({
  organizationId: Joi.number().integer().positive().required(),
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
});

export const updateScrapCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
});

export const scrapCategoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  organizationId: Joi.number().integer().positive().optional(),
});

export const scrapCategoryIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

