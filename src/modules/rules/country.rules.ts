import Joi from 'joi';

export const createCountrySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Country name must be at least 2 characters long',
    'string.max': 'Country name cannot exceed 100 characters',
    'any.required': 'Country name is required'
  }),
  currency: Joi.string().required().messages({
    'any.required': 'Currency is required'
  }),
  isActive: Joi.boolean().optional()
});

export const updateCountrySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Country name must be at least 2 characters long',
    'string.max': 'Country name cannot exceed 100 characters'
  }),
  currency: Joi.string().optional().messages({
    'any.required': 'Currency is required'
  }),
  isActive: Joi.boolean().optional()
});

export const countryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  isActive: Joi.boolean().optional()
});

export const countryIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.positive': 'Country ID must be a positive number',
    'any.required': 'Country ID is required'
  })
});

export const countryCodeSchema = Joi.object({
  code: Joi.string().length(2).uppercase().required().messages({
    'string.length': 'Country code must be exactly 2 characters',
    'any.required': 'Country code is required'
  })
}); 