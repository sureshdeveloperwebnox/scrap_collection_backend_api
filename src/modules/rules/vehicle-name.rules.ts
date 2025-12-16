import Joi from 'joi';

export const createVehicleNameSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required().messages({
    'number.positive': 'Organization ID must be a positive number',
    'any.required': 'Organization ID is required'
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Vehicle name must be at least 2 characters long',
    'string.max': 'Vehicle name cannot exceed 100 characters',
    'any.required': 'Vehicle name is required'
  }),
  vehicleTypeId: Joi.number().integer().positive().required().messages({
    'number.positive': 'Vehicle type ID must be a positive number',
    'any.required': 'Vehicle type ID is required'
  }),
  scrapYardId: Joi.string().uuid().optional().messages({
    'string.guid': 'Scrap yard ID must be a valid UUID'
  }),
  isActive: Joi.boolean().default(true).messages({
    'boolean.base': 'isActive must be a boolean value'
  })
});

export const updateVehicleNameSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Vehicle name must be at least 2 characters long',
    'string.max': 'Vehicle name cannot exceed 100 characters'
  }),
  vehicleTypeId: Joi.number().integer().positive().optional().messages({
    'number.positive': 'Vehicle type ID must be a positive number'
  }),
  scrapYardId: Joi.string().uuid().optional().messages({
    'string.guid': 'Scrap yard ID must be a valid UUID'
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be a boolean value'
  })
});

export const vehicleNameQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  isActive: Joi.boolean().optional(),
  organizationId: Joi.number().integer().positive().optional(),
  vehicleTypeId: Joi.number().integer().positive().optional(),
  scrapYardId: Joi.string().uuid().optional(),
  sortBy: Joi.string().valid('name', 'isActive', 'createdAt', 'updatedAt').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

export const vehicleNameIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Vehicle name ID must be a valid UUID',
    'any.required': 'Vehicle name ID is required'
  })
});
