import Joi from 'joi';
import { EmployeeRole } from '../model/enum';
import { phoneCustomValidation } from '../../utils/phone-validator';

export const createEmployeeSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required(),
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().custom(phoneCustomValidation, 'phone validation').required().messages({
    'any.required': 'Phone number is required',
    'any.custom': '{{#error.message}}'
  }),
  role: Joi.string().valid(...Object.values(EmployeeRole)).required(),
  workZone: Joi.string().optional(),
  password: Joi.string().min(6).required(),
  profilePhoto: Joi.string().uri().optional(),
  scrapYardId: Joi.string().uuid().optional()
});

export const updateEmployeeSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().custom(phoneCustomValidation, 'phone validation').optional().messages({
    'any.custom': '{{#error.message}}'
  }),
  role: Joi.string().valid(...Object.values(EmployeeRole)).optional(),
  workZone: Joi.string().optional(),
  password: Joi.string().min(6).optional(),
  isActive: Joi.boolean().optional(),
  profilePhoto: Joi.string().uri().optional(),
  scrapYardId: Joi.string().uuid().optional(),
  deviceToken: Joi.string().optional()
});

export const employeeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  role: Joi.string().valid(...Object.values(EmployeeRole)).optional(),
  isActive: Joi.boolean().optional(),
  organizationId: Joi.number().integer().positive().optional(),
  workZone: Joi.string().optional()
});

export const employeeIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});
