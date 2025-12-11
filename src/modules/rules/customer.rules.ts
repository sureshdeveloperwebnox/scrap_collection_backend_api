import Joi from 'joi';
import { CustomerStatus } from '../model/enum';
import { phoneCustomValidation } from '../../utils/phone-validator';

export const createCustomerSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required().messages({
    'number.positive': 'Organization ID must be a positive number',
    'any.required': 'Organization ID is required'
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required'
  }),
  phone: Joi.string().custom(phoneCustomValidation, 'phone validation').required().messages({
    'any.required': 'Phone number is required',
    'any.custom': '{{#error.message}}'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  }),
  address: Joi.string().max(500).optional().messages({
    'string.max': 'Address cannot exceed 500 characters'
  }),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  userId: Joi.string().uuid().optional()
});

export const updateCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().custom(phoneCustomValidation, 'phone validation').optional().messages({
    'any.custom': '{{#error.message}}'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  }),
  address: Joi.string().max(500).optional().messages({
    'string.max': 'Address cannot exceed 500 characters'
  }),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  accountStatus: Joi.string().valid(...Object.values(CustomerStatus)).optional()
});

export const customerQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  organizationId: Joi.number().integer().positive().optional(),
  accountStatus: Joi.string().valid(...Object.values(CustomerStatus)).optional()
});

export const customerIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Customer ID must be a valid UUID',
    'any.required': 'Customer ID is required'
  })
});

export const customerUserIdSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.guid': 'User ID must be a valid UUID',
    'any.required': 'User ID is required'
  })
});
