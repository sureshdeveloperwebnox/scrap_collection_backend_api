import Joi from 'joi';

export const createCitySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'City name must be at least 2 characters long',
    'string.max': 'City name cannot exceed 100 characters',
    'any.required': 'City name is required'
  }),
  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
    'any.required': 'Latitude is required'
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
    'any.required': 'Longitude is required'
  }),
  isActive: Joi.boolean().default(true).messages({
    'boolean.base': 'isActive must be a boolean value'
  })
});

export const updateCitySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'City name must be at least 2 characters long',
    'string.max': 'City name cannot exceed 100 characters'
  }),
  latitude: Joi.number().min(-90).max(90).optional().messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90'
  }),
  longitude: Joi.number().min(-180).max(180).optional().messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180'
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be a boolean value'
  })
});

export const cityQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'isActive', 'createdAt', 'updatedAt').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

export const cityIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.positive': 'City ID must be a positive number',
    'any.required': 'City ID is required'
  })
});

