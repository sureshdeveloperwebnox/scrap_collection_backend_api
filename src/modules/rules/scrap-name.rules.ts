import Joi from 'joi';

export const createScrapNameSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required(),
  name: Joi.string().min(2).max(100).required(),
  scrapCategoryId: Joi.string().uuid().required(),
  isActive: Joi.boolean().default(true),
});

export const updateScrapNameSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  scrapCategoryId: Joi.string().uuid().optional(),
  isActive: Joi.boolean().optional(),
});

export const scrapNameQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  scrapCategoryId: Joi.string().uuid().optional(),
  organizationId: Joi.number().integer().positive().optional(),
  isActive: Joi.boolean().optional(),
});

export const scrapNameIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

