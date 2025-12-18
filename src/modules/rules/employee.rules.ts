import Joi from 'joi';
import { phoneCustomValidation } from '../../utils/phone-validator';

export const createEmployeeSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required(),
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().custom(phoneCustomValidation, 'phone validation').required().messages({
    'any.required': 'Phone number is required',
    'any.custom': '{{#error.message}}'
  }),
  roleId: Joi.number().integer().positive().required().messages({
    'any.required': 'Role is required',
    'number.positive': 'Role ID must be a positive number'
  }),
  cityId: Joi.number().integer().positive().optional().messages({
    'number.positive': 'City ID must be a positive number'
  }),
  scrapYardId: Joi.string().uuid().optional().allow(null),
  password: Joi.string().min(6).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters long'
  })
});

export const updateEmployeeSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().custom(phoneCustomValidation, 'phone validation').optional().messages({
    'any.custom': '{{#error.message}}'
  }),
  roleId: Joi.number().integer().positive().optional().messages({
    'number.positive': 'Role ID must be a positive number'
  }),
  cityId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.positive': 'City ID must be a positive number'
  }),
  scrapYardId: Joi.string().uuid().optional().allow(null),
  password: Joi.string().min(6).optional(),
  isActive: Joi.boolean().optional(),
  deviceToken: Joi.string().optional()
});

export const employeeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  roleId: Joi.number().integer().positive().optional(),
  role: Joi.string().optional(),
  cityId: Joi.number().integer().positive().optional(),
  isActive: Joi.boolean().optional(),
  organizationId: Joi.number().integer().positive().optional()
});

export const employeeIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});
