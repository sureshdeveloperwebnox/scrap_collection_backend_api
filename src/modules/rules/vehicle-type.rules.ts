import Joi from 'joi';

export const createVehicleTypeSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required().messages({
    'number.positive': 'Organization ID must be a positive number',
    'any.required': 'Organization ID is required'
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Vehicle type name must be at least 2 characters long',
    'string.max': 'Vehicle type name cannot exceed 100 characters',
    'any.required': 'Vehicle type name is required'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  isActive: Joi.boolean().default(true).messages({
    'boolean.base': 'isActive must be a boolean value'
  })
});

export const updateVehicleTypeSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Vehicle type name must be at least 2 characters long',
    'string.max': 'Vehicle type name cannot exceed 100 characters'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be a boolean value'
  })
});

export const vehicleTypeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  isActive: Joi.boolean().optional(),
  organizationId: Joi.number().integer().positive().optional()
});

export const vehicleTypeIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.positive': 'Vehicle type ID must be a positive number',
    'any.required': 'Vehicle type ID is required'
  })
}); 