import Joi from 'joi';
import { OrderStatus, PaymentStatusEnum } from '../model/enum';
import { phoneCustomValidation } from '../../utils/phone-validator';

export const createOrderSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required().messages({
    'any.required': 'Organization ID is required',
    'number.base': 'Organization ID must be a number',
    'number.positive': 'Organization ID must be a positive number'
  }),
  leadId: Joi.string().uuid().optional().messages({
    'string.guid': 'Lead ID must be a valid UUID'
  }),
  customerName: Joi.string().min(2).max(100).trim().required().messages({
    'any.required': 'Customer name is required',
    'string.empty': 'Customer name cannot be empty',
    'string.min': 'Customer name must be at least 2 characters long',
    'string.max': 'Customer name cannot exceed 100 characters'
  }),
  customerPhone: Joi.string().custom(phoneCustomValidation, 'phone validation').required().messages({
    'any.required': 'Phone number is required',
    'string.empty': 'Phone number cannot be empty',
    'any.custom': '{{#error.message}}'
  }),
  customerEmail: Joi.string().email().optional().allow('').messages({
    'string.email': 'Please provide a valid email address'
  }),
  address: Joi.string().min(5).max(500).trim().required().messages({
    'any.required': 'Collection address is required',
    'string.empty': 'Collection address cannot be empty',
    'string.min': 'Collection address must be at least 5 characters long',
    'string.max': 'Collection address cannot exceed 500 characters'
  }),
  latitude: Joi.number().min(-90).max(90).optional().messages({
    'number.base': 'Latitude must be a number',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90'
  }),
  longitude: Joi.number().min(-180).max(180).optional().messages({
    'number.base': 'Longitude must be a number',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180'
  }),
  vehicleDetails: Joi.object({
    type: Joi.string().optional(),
    make: Joi.string().max(100).optional().messages({
      'string.max': 'Vehicle make cannot exceed 100 characters'
    }),
    model: Joi.string().max(100).optional().messages({
      'string.max': 'Vehicle model cannot exceed 100 characters'
    }),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional().messages({
      'number.base': 'Year must be a number',
      'number.integer': 'Year must be a whole number',
      'number.min': 'Year must be 1900 or later',
      'number.max': `Year cannot be later than ${new Date().getFullYear() + 1}`
    }),
    condition: Joi.string().max(200).optional().messages({
      'string.max': 'Condition cannot exceed 200 characters'
    }),
    description: Joi.string().allow('').optional().custom((value, helpers) => {
      if (value && value.trim().length > 0) {
        if (value.trim().length < 5) {
          return helpers.error('string.min');
        }

      }
      return value;
    }).messages({
      'string.min': 'Scrap description must be at least 5 characters long',
      'string.max': 'Scrap description cannot exceed 1000 characters'
    }),
    scrapCategoryId: Joi.string().uuid().optional().messages({
      'string.guid': 'Scrap category ID must be a valid UUID'
    }),
    scrapNameId: Joi.string().uuid().optional().messages({
      'string.guid': 'Scrap name ID must be a valid UUID'
    })
  }).required().messages({
    'any.required': 'Vehicle details are required',
    'object.base': 'Vehicle details must be an object'
  }),
  photos: Joi.any().optional(),
  assignedCollectorId: Joi.string().uuid().optional().messages({
    'string.guid': 'Assigned collector ID must be a valid UUID'
  }),
  pickupTime: Joi.date().iso().min('now').required().messages({
    'any.required': 'Pickup date and time is required',
    'date.base': 'Pickup time must be a valid date',
    'date.format': 'Pickup time must be in ISO format',
    'date.min': 'Pickup time cannot be in the past'
  }),
  quotedPrice: Joi.number().min(0).precision(2).optional().messages({
    'number.base': 'Quoted price must be a number',
    'number.min': 'Quoted price cannot be negative',
    'number.precision': 'Quoted price can have at most 2 decimal places'
  }),
  actualPrice: Joi.number().min(0).precision(2).optional().messages({
    'number.base': 'Actual price must be a number',
    'number.min': 'Actual price cannot be negative',
    'number.precision': 'Actual price can have at most 2 decimal places'
  }),
  yardId: Joi.string().uuid().optional().messages({
    'string.guid': 'Scrap yard ID must be a valid UUID'
  }),
  crewId: Joi.string().uuid().optional().messages({
    'string.guid': 'Crew ID must be a valid UUID'
  }),
  routeDistance: Joi.string().max(50).optional().messages({
    'string.max': 'Route distance cannot exceed 50 characters'
  }),
  routeDuration: Joi.string().max(50).optional().messages({
    'string.max': 'Route duration cannot exceed 50 characters'
  }),
  customerNotes: Joi.string().max(1000).optional().messages({
    'string.max': 'Customer notes cannot exceed 1000 characters'
  }),
  adminNotes: Joi.string().max(1000).optional().messages({
    'string.max': 'Admin notes cannot exceed 1000 characters'
  }),
  instructions: Joi.string().max(2000).trim().optional().messages({
    'string.max': 'Instructions cannot exceed 2000 characters'
  }),
  customerId: Joi.string().uuid().optional().messages({
    'string.guid': 'Customer ID must be a valid UUID'
  })
});


export const updateOrderSchema = Joi.object({
  customerName: Joi.string().min(2).max(100).trim().optional().messages({
    'string.empty': 'Customer name cannot be empty',
    'string.min': 'Customer name must be at least 2 characters long',
    'string.max': 'Customer name cannot exceed 100 characters'
  }),
  customerPhone: Joi.string().custom(phoneCustomValidation, 'phone validation').optional().messages({
    'string.empty': 'Phone number cannot be empty',
    'any.custom': '{{#error.message}}'
  }),
  customerEmail: Joi.string().email().optional().allow('').messages({
    'string.email': 'Please provide a valid email address'
  }),
  address: Joi.string().min(5).max(500).trim().optional().messages({
    'string.empty': 'Collection address cannot be empty',
    'string.min': 'Collection address must be at least 5 characters long',
    'string.max': 'Collection address cannot exceed 500 characters'
  }),
  latitude: Joi.number().min(-90).max(90).optional().messages({
    'number.base': 'Latitude must be a number',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90'
  }),
  longitude: Joi.number().min(-180).max(180).optional().messages({
    'number.base': 'Longitude must be a number',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180'
  }),
  vehicleDetails: Joi.object({
    type: Joi.string().optional(),
    make: Joi.string().max(100).optional().messages({
      'string.max': 'Vehicle make cannot exceed 100 characters'
    }),
    model: Joi.string().max(100).optional().messages({
      'string.max': 'Vehicle model cannot exceed 100 characters'
    }),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional().messages({
      'number.base': 'Year must be a number',
      'number.integer': 'Year must be a whole number',
      'number.min': 'Year must be 1900 or later',
      'number.max': `Year cannot be later than ${new Date().getFullYear() + 1}`
    }),
    condition: Joi.string().max(200).optional().messages({
      'string.max': 'Condition cannot exceed 200 characters'
    }),
    description: Joi.string().max(1000).optional().messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    scrapCategoryId: Joi.string().uuid().optional().messages({
      'string.guid': 'Scrap category ID must be a valid UUID'
    }),
    scrapNameId: Joi.string().uuid().optional().messages({
      'string.guid': 'Scrap name ID must be a valid UUID'
    })
  }).optional().messages({
    'object.base': 'Vehicle details must be an object'
  }),
  assignedCollectorId: Joi.string().uuid().optional().allow(null).messages({
    'string.guid': 'Assigned collector ID must be a valid UUID'
  }),
  pickupTime: Joi.date().iso().optional().allow(null).messages({
    'date.base': 'Pickup time must be a valid date',
    'date.format': 'Pickup time must be in ISO format'
  }),
  orderStatus: Joi.string().valid(...Object.values(OrderStatus)).optional().messages({
    'any.only': `Order status must be one of: ${Object.values(OrderStatus).join(', ')}`
  }),
  paymentStatus: Joi.string().valid(...Object.values(PaymentStatusEnum)).optional().messages({
    'any.only': `Payment status must be one of: ${Object.values(PaymentStatusEnum).join(', ')}`
  }),
  quotedPrice: Joi.number().min(0).precision(2).optional().allow(null).messages({
    'number.base': 'Quoted price must be a number',
    'number.min': 'Quoted price cannot be negative',
    'number.precision': 'Quoted price can have at most 2 decimal places'
  }),
  actualPrice: Joi.number().min(0).precision(2).optional().allow(null).messages({
    'number.base': 'Actual price must be a number',
    'number.min': 'Actual price cannot be negative',
    'number.precision': 'Actual price can have at most 2 decimal places'
  }),
  yardId: Joi.string().uuid().optional().allow(null).messages({
    'string.guid': 'Scrap yard ID must be a valid UUID'
  }),
  crewId: Joi.string().uuid().optional().allow(null).messages({
    'string.guid': 'Crew ID must be a valid UUID'
  }),
  routeDistance: Joi.string().max(50).optional().allow(null).messages({
    'string.max': 'Route distance cannot exceed 50 characters'
  }),
  routeDuration: Joi.string().max(50).optional().allow(null).messages({
    'string.max': 'Route duration cannot exceed 50 characters'
  }),
  customerNotes: Joi.string().max(1000).optional().allow(null).messages({
    'string.max': 'Customer notes cannot exceed 1000 characters'
  }),
  adminNotes: Joi.string().max(1000).optional().allow(null).messages({
    'string.max': 'Admin notes cannot exceed 1000 characters'
  }),
  instructions: Joi.string().max(2000).trim().optional().allow(null).messages({
    'string.max': 'Instructions cannot exceed 2000 characters'
  })
});

export const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  status: Joi.string().valid(...Object.values(OrderStatus)).optional(),
  paymentStatus: Joi.string().valid(...Object.values(PaymentStatusEnum)).optional(),
  collectorId: Joi.string().uuid().optional(),
  organizationId: Joi.number().integer().positive().optional(),
  dateFrom: Joi.string().isoDate().optional(),
  dateTo: Joi.string().isoDate().optional(),
  location: Joi.string().optional()
});

export const orderIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});

export const assignOrderSchema = Joi.object({
  collectorId: Joi.string().uuid().optional(),
  collectorIds: Joi.array().items(Joi.string().uuid()).optional(),
  crewId: Joi.string().uuid().optional(),
  yardId: Joi.string().uuid().optional(),
  routeDistance: Joi.string().optional(),
  routeDuration: Joi.string().optional(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
  notes: Joi.string().optional()
});
