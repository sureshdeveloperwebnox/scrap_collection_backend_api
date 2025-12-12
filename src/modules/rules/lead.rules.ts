import Joi from 'joi';
import { LeadStatus, VehicleTypeEnum, VehicleConditionEnum, LeadSourceEnum } from '../model/enum';
import { phoneCustomValidation } from '../../utils/phone-validator';

export const createLeadSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required().messages({
    'number.positive': 'Organization ID must be a positive number',
    'any.required': 'Organization ID is required'
  }),
  fullName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name cannot exceed 100 characters',
    'any.required': 'Full name is required'
  }),
  phone: Joi.string().custom(phoneCustomValidation, 'phone validation').required().messages({
    'any.required': 'Phone number is required',
    'any.custom': '{{#error.message}}'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  vehicleType: Joi.string().valid(...Object.values(VehicleTypeEnum)).required().messages({
    'any.only': 'Vehicle type must be one of: CAR, BIKE, TRUCK, BOAT, VAN, SUV',
    'any.required': 'Vehicle type is required'
  }),
  vehicleMake: Joi.string().max(50).optional(),
  vehicleModel: Joi.string().max(50).optional(),
  vehicleYear: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  vehicleCondition: Joi.string().valid(...Object.values(VehicleConditionEnum)).required().messages({
    'any.only': 'Vehicle condition must be one of: JUNK, DAMAGED, WRECKED, ACCIDENTAL, FULLY_SCRAP',
    'any.required': 'Vehicle condition is required'
  }),
  locationAddress: Joi.string().min(5).max(500).required().messages({
    'string.min': 'Location address must be at least 5 characters long',
    'string.max': 'Location address cannot exceed 500 characters',
    'any.required': 'Location address is required'
  }),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  leadSource: Joi.string().valid(...Object.values(LeadSourceEnum)).required().messages({
    'any.only': 'Lead source must be one of: WEBFORM, CHATBOT, CALL, MANUAL',
    'any.required': 'Lead source is required'
  }),
  photos: Joi.array().items(Joi.string().uri()).optional(),
  notes: Joi.string().optional(),
  customerId: Joi.string().uuid().optional()
});

export const updateLeadSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().custom(phoneCustomValidation, 'phone validation').optional().messages({
    'any.custom': '{{#error.message}}'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  }),
  vehicleType: Joi.string().valid(...Object.values(VehicleTypeEnum)).optional(),
  vehicleMake: Joi.string().max(50).optional(),
  vehicleModel: Joi.string().max(50).optional(),
  vehicleYear: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  vehicleCondition: Joi.string().valid(...Object.values(VehicleConditionEnum)).optional(),
  locationAddress: Joi.string().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  leadSource: Joi.string().valid(...Object.values(LeadSourceEnum)).optional(),
  photos: Joi.array().items(Joi.string().uri()).optional(),
  notes: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(LeadStatus)).optional()
});

export const leadQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  status: Joi.string().valid(...Object.values(LeadStatus)).optional(),
  vehicleType: Joi.string().valid(...Object.values(VehicleTypeEnum)).optional().messages({
    'any.only': 'Vehicle type must be one of: CAR, BIKE, TRUCK, BOAT, VAN, SUV'
  }),
  vehicleCondition: Joi.string().valid(...Object.values(VehicleConditionEnum)).optional().messages({
    'any.only': 'Vehicle condition must be one of: JUNK, DAMAGED, WRECKED, ACCIDENTAL, FULLY_SCRAP'
  }),
  leadSource: Joi.string().valid(...Object.values(LeadSourceEnum)).optional().messages({
    'any.only': 'Lead source must be one of: WEBFORM, CHATBOT, CALL, MANUAL'
  }),
  organizationId: Joi.number().integer().positive().optional(),
  dateFrom: Joi.string().isoDate().optional(),
  dateTo: Joi.string().isoDate().optional(),
  sortBy: Joi.string().valid('fullName', 'phone', 'email', 'status', 'createdAt', 'updatedAt').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

export const leadIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Lead ID must be a valid UUID',
    'any.required': 'Lead ID is required'
  })
});

export const convertLeadSchema = Joi.object({
  quotedPrice: Joi.number().positive().optional(),
  pickupTime: Joi.date().optional(),
  assignedCollectorId: Joi.string().uuid().optional(),
  yardId: Joi.string().uuid().optional(),
  customerNotes: Joi.string().optional(),
  adminNotes: Joi.string().optional()
});
