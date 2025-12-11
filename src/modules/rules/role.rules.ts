import Joi from 'joi';

export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Role name must be at least 2 characters long',
    'string.max': 'Role name cannot exceed 100 characters',
    'any.required': 'Role name is required'
  }),
  description: Joi.string().max(500).optional().allow('', null).messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  isActive: Joi.boolean().default(true).messages({
    'boolean.base': 'isActive must be a boolean value'
  })
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Role name must be at least 2 characters long',
    'string.max': 'Role name cannot exceed 100 characters'
  }),
  description: Joi.string().max(500).optional().allow('', null).messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be a boolean value'
  })
});

export const roleQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'isActive', 'createdAt', 'updatedAt').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

export const roleIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.positive': 'Role ID must be a positive number',
    'any.required': 'Role ID is required'
  })
});

