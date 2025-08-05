import Joi from 'joi';
import { LeadStatus, ScrapCategory } from '../model/enum';

export const createLeadSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required().messages({
    'number.positive': 'Organization ID must be a positive number',
    'any.required': 'Organization ID is required'
  }),
  customerId: Joi.number().integer().positive().required().messages({
    'number.positive': 'Customer ID must be a positive number',
    'any.required': 'Customer ID is required'
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Lead name must be at least 2 characters long',
    'string.max': 'Lead name cannot exceed 100 characters',
    'any.required': 'Lead name is required'
  }),
  contact: Joi.string().min(10).max(20).required().messages({
    'string.min': 'Contact number must be at least 10 characters long',
    'string.max': 'Contact number cannot exceed 20 characters',
    'any.required': 'Contact number is required'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  }),
  location: Joi.string().max(255).optional().messages({
    'string.max': 'Location cannot exceed 255 characters'
  }),
  vehicleTypeId: Joi.number().integer().positive().required().messages({
    'number.positive': 'Vehicle type ID must be a positive number',
    'any.required': 'Vehicle type ID is required'
  }),
  scrapCategory: Joi.string().valid(...Object.values(ScrapCategory)).required().messages({
    'any.only': 'Scrap category must be one of: JUNK, ACCIDENT_DAMAGED, FULLY_SCRAP',
    'any.required': 'Scrap category is required'
  })
});

export const updateLeadSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Lead name must be at least 2 characters long',
    'string.max': 'Lead name cannot exceed 100 characters'
  }),
  contact: Joi.string().min(10).max(20).optional().messages({
    'string.min': 'Contact number must be at least 10 characters long',
    'string.max': 'Contact number cannot exceed 20 characters'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  }),
  location: Joi.string().max(255).optional().messages({
    'string.max': 'Location cannot exceed 255 characters'
  }),
  vehicleTypeId: Joi.number().integer().positive().optional().messages({
    'number.positive': 'Vehicle type ID must be a positive number'
  }),
  scrapCategory: Joi.string().valid(...Object.values(ScrapCategory)).optional().messages({
    'any.only': 'Scrap category must be one of: JUNK, ACCIDENT_DAMAGED, FULLY_SCRAP'
  }),
  status: Joi.string().valid(...Object.values(LeadStatus)).optional().messages({
    'any.only': 'Status must be one of: PENDING, CONVERTED, REJECTED'
  })
});

export const leadQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  status: Joi.string().valid(...Object.values(LeadStatus)).optional(),
  scrapCategory: Joi.string().valid(...Object.values(ScrapCategory)).optional(),
  organizationId: Joi.number().integer().positive().optional(),
  customerId: Joi.number().integer().positive().optional()
});

export const leadIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.positive': 'Lead ID must be a positive number',
    'any.required': 'Lead ID is required'
  })
});

export const convertLeadSchema = Joi.object({
  status: Joi.string().valid(LeadStatus.CONVERTED, LeadStatus.REJECTED).required().messages({
    'any.only': 'Status must be either CONVERTED or REJECTED',
    'any.required': 'Status is required'
  })
}); 