import Joi from 'joi';

export const createScrapYardSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required(),
  yardName: Joi.string().min(2).max(100).required(),
  address: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  capacity: Joi.number().integer().positive().required(),
  assignedEmployeeIds: Joi.array().items(Joi.string().uuid()).optional(),
  operatingHours: Joi.object().optional()
});

export const updateScrapYardSchema = Joi.object({
  yardName: Joi.string().min(2).max(100).optional(),
  address: Joi.string().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  capacity: Joi.number().integer().positive().optional(),
  assignedEmployeeIds: Joi.array().items(Joi.string().uuid()).optional(),
  operatingHours: Joi.object().optional()
});

export const scrapYardQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  organizationId: Joi.number().integer().positive().optional()
});

export const scrapYardIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});
