import Joi from 'joi';

export const createVehicleNameSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required().messages({
    'number.positive': 'Organization ID must be a positive number',
    'any.required': 'Organization ID is required'
  }),
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Vehicle name must be at least 2 characters long',
    'string.max': 'Vehicle name cannot exceed 100 characters'
  }),
  vehicleTypeId: Joi.number().integer().positive().required().messages({
    'number.positive': 'Vehicle type ID must be a positive number',
    'any.required': 'Vehicle type ID is required'
  }),
  make: Joi.string().max(50).optional().allow('', null).messages({
    'string.max': 'Make cannot exceed 50 characters'
  }),
  model: Joi.string().max(50).optional().allow('', null).messages({
    'string.max': 'Model cannot exceed 50 characters'
  }),
  condition: Joi.string().valid('JUNK', 'DAMAGED', 'WRECKED', 'ACCIDENTAL', 'FULLY_SCRAP').optional().allow('', null).messages({
    'any.only': 'Condition must be one of: JUNK, DAMAGED, WRECKED, ACCIDENTAL, FULLY_SCRAP'
  }),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional().allow(null).messages({
    'number.min': 'Year must be 1900 or later',
    'number.max': `Year cannot exceed ${new Date().getFullYear() + 1}`
  }),
  vehicleId: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Vehicle ID is required',
    'string.max': 'Vehicle ID cannot exceed 100 characters',
    'any.required': 'Vehicle ID is required',
    'string.empty': 'Vehicle ID cannot be empty'
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
  make: Joi.string().max(50).optional().allow('', null).messages({
    'string.max': 'Make cannot exceed 50 characters'
  }),
  model: Joi.string().max(50).optional().allow('', null).messages({
    'string.max': 'Model cannot exceed 50 characters'
  }),
  condition: Joi.string().valid('JUNK', 'DAMAGED', 'WRECKED', 'ACCIDENTAL', 'FULLY_SCRAP').optional().allow('', null).messages({
    'any.only': 'Condition must be one of: JUNK, DAMAGED, WRECKED, ACCIDENTAL, FULLY_SCRAP'
  }),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional().allow(null).messages({
    'number.min': 'Year must be 1900 or later',
    'number.max': `Year cannot exceed ${new Date().getFullYear() + 1}`
  }),
  vehicleId: Joi.string().max(100).optional().allow('', null).messages({
    'string.max': 'Vehicle ID cannot exceed 100 characters'
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
  sortBy: Joi.string().valid('name', 'isActive', 'createdAt', 'updatedAt').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

export const vehicleNameIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Vehicle name ID must be a valid UUID',
    'any.required': 'Vehicle name ID is required'
  })
});
