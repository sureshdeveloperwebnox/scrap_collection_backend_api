import Joi from 'joi';

export const createCustomerSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required().messages({
    'number.positive': 'Organization ID must be a positive number',
    'any.required': 'Organization ID is required'
  }),
  userId: Joi.string().min(1).required().messages({
    'string.empty': 'User ID cannot be empty',
    'any.required': 'User ID is required'
  }),
  address: Joi.string().max(500).optional().messages({
    'string.max': 'Address cannot exceed 500 characters'
  })
});

export const updateCustomerSchema = Joi.object({
  address: Joi.string().max(500).optional().messages({
    'string.max': 'Address cannot exceed 500 characters'
  })
});

export const customerQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  organizationId: Joi.number().integer().positive().optional(),
  isActive: Joi.boolean().optional()
});

export const customerIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.positive': 'Customer ID must be a positive number',
    'any.required': 'Customer ID is required'
  })
});

export const customerUserIdSchema = Joi.object({
  userId: Joi.string().min(1).required().messages({
    'string.empty': 'User ID cannot be empty',
    'any.required': 'User ID is required'
  })
}); 