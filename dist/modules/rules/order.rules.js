"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignOrderSchema = exports.orderIdSchema = exports.orderQuerySchema = exports.updateOrderSchema = exports.createOrderSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const enum_1 = require("../model/enum");
exports.createOrderSchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required().messages({
        'any.required': 'Organization ID is required',
        'number.base': 'Organization ID must be a number',
        'number.positive': 'Organization ID must be a positive number'
    }),
    leadId: joi_1.default.string().uuid().optional().messages({
        'string.guid': 'Lead ID must be a valid UUID'
    }),
    customerName: joi_1.default.string().min(2).max(100).trim().required().messages({
        'any.required': 'Customer name is required',
        'string.empty': 'Customer name cannot be empty',
        'string.min': 'Customer name must be at least 2 characters long',
        'string.max': 'Customer name cannot exceed 100 characters'
    }),
    customerEmail: joi_1.default.string().email().optional().allow('').messages({
        'string.email': 'Please provide a valid email address'
    }),
    address: joi_1.default.string().min(5).max(500).trim().required().messages({
        'any.required': 'Collection address is required',
        'string.empty': 'Collection address cannot be empty',
        'string.min': 'Collection address must be at least 5 characters long',
        'string.max': 'Collection address cannot exceed 500 characters'
    }),
    latitude: joi_1.default.number().min(-90).max(90).optional().messages({
        'number.base': 'Latitude must be a number',
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90'
    }),
    longitude: joi_1.default.number().min(-180).max(180).optional().messages({
        'number.base': 'Longitude must be a number',
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180'
    }),
    vehicleDetails: joi_1.default.object({
        type: joi_1.default.string().optional(),
        make: joi_1.default.string().max(100).optional().messages({
            'string.max': 'Vehicle make cannot exceed 100 characters'
        }),
        model: joi_1.default.string().max(100).optional().messages({
            'string.max': 'Vehicle model cannot exceed 100 characters'
        }),
        year: joi_1.default.number().integer().min(1900).max(new Date().getFullYear() + 1).optional().messages({
            'number.base': 'Year must be a number',
            'number.integer': 'Year must be a whole number',
            'number.min': 'Year must be 1900 or later',
            'number.max': `Year cannot be later than ${new Date().getFullYear() + 1}`
        }),
        condition: joi_1.default.string().max(200).optional().messages({
            'string.max': 'Condition cannot exceed 200 characters'
        }),
        description: joi_1.default.string().allow('').optional().custom((value, helpers) => {
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
        scrapCategoryId: joi_1.default.string().uuid().optional().messages({
            'string.guid': 'Scrap category ID must be a valid UUID'
        }),
        scrapNameId: joi_1.default.string().uuid().optional().messages({
            'string.guid': 'Scrap name ID must be a valid UUID'
        })
    }).required().messages({
        'any.required': 'Vehicle details are required',
        'object.base': 'Vehicle details must be an object'
    }),
    photos: joi_1.default.any().optional(),
    assignedCollectorId: joi_1.default.string().uuid().optional().messages({
        'string.guid': 'Assigned collector ID must be a valid UUID'
    }),
    pickupTime: joi_1.default.date().iso().min('now').required().messages({
        'any.required': 'Pickup date and time is required',
        'date.base': 'Pickup time must be a valid date',
        'date.format': 'Pickup time must be in ISO format',
        'date.min': 'Pickup time cannot be in the past'
    }),
    quotedPrice: joi_1.default.number().min(0).precision(2).optional().messages({
        'number.base': 'Quoted price must be a number',
        'number.min': 'Quoted price cannot be negative',
        'number.precision': 'Quoted price can have at most 2 decimal places'
    }),
    actualPrice: joi_1.default.number().min(0).precision(2).optional().messages({
        'number.base': 'Actual price must be a number',
        'number.min': 'Actual price cannot be negative',
        'number.precision': 'Actual price can have at most 2 decimal places'
    }),
    yardId: joi_1.default.string().uuid().optional().messages({
        'string.guid': 'Scrap yard ID must be a valid UUID'
    }),
    crewId: joi_1.default.string().uuid().optional().messages({
        'string.guid': 'Crew ID must be a valid UUID'
    }),
    routeDistance: joi_1.default.string().max(50).optional().messages({
        'string.max': 'Route distance cannot exceed 50 characters'
    }),
    routeDuration: joi_1.default.string().max(50).optional().messages({
        'string.max': 'Route duration cannot exceed 50 characters'
    }),
    customerNotes: joi_1.default.string().max(1000).optional().messages({
        'string.max': 'Customer notes cannot exceed 1000 characters'
    }),
    adminNotes: joi_1.default.string().max(1000).optional().messages({
        'string.max': 'Admin notes cannot exceed 1000 characters'
    }),
    instructions: joi_1.default.string().max(2000).trim().optional().messages({
        'string.max': 'Instructions cannot exceed 2000 characters'
    }),
    customerId: joi_1.default.string().uuid().optional().messages({
        'string.guid': 'Customer ID must be a valid UUID'
    })
});
exports.updateOrderSchema = joi_1.default.object({
    customerName: joi_1.default.string().min(2).max(100).trim().optional().messages({
        'string.empty': 'Customer name cannot be empty',
        'string.min': 'Customer name must be at least 2 characters long',
        'string.max': 'Customer name cannot exceed 100 characters'
    }),
    customerEmail: joi_1.default.string().email().optional().allow('').messages({
        'string.email': 'Please provide a valid email address'
    }),
    address: joi_1.default.string().min(5).max(500).trim().optional().messages({
        'string.empty': 'Collection address cannot be empty',
        'string.min': 'Collection address must be at least 5 characters long',
        'string.max': 'Collection address cannot exceed 500 characters'
    }),
    latitude: joi_1.default.number().min(-90).max(90).optional().messages({
        'number.base': 'Latitude must be a number',
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90'
    }),
    longitude: joi_1.default.number().min(-180).max(180).optional().messages({
        'number.base': 'Longitude must be a number',
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180'
    }),
    vehicleDetails: joi_1.default.object({
        type: joi_1.default.string().optional(),
        make: joi_1.default.string().max(100).optional().messages({
            'string.max': 'Vehicle make cannot exceed 100 characters'
        }),
        model: joi_1.default.string().max(100).optional().messages({
            'string.max': 'Vehicle model cannot exceed 100 characters'
        }),
        year: joi_1.default.number().integer().min(1900).max(new Date().getFullYear() + 1).optional().messages({
            'number.base': 'Year must be a number',
            'number.integer': 'Year must be a whole number',
            'number.min': 'Year must be 1900 or later',
            'number.max': `Year cannot be later than ${new Date().getFullYear() + 1}`
        }),
        condition: joi_1.default.string().max(200).optional().messages({
            'string.max': 'Condition cannot exceed 200 characters'
        }),
        description: joi_1.default.string().max(1000).optional().messages({
            'string.max': 'Description cannot exceed 1000 characters'
        }),
        scrapCategoryId: joi_1.default.string().uuid().optional().messages({
            'string.guid': 'Scrap category ID must be a valid UUID'
        }),
        scrapNameId: joi_1.default.string().uuid().optional().messages({
            'string.guid': 'Scrap name ID must be a valid UUID'
        })
    }).optional().messages({
        'object.base': 'Vehicle details must be an object'
    }),
    assignedCollectorId: joi_1.default.string().uuid().optional().allow(null).messages({
        'string.guid': 'Assigned collector ID must be a valid UUID'
    }),
    pickupTime: joi_1.default.date().iso().optional().allow(null).messages({
        'date.base': 'Pickup time must be a valid date',
        'date.format': 'Pickup time must be in ISO format'
    }),
    orderStatus: joi_1.default.string().valid(...Object.values(enum_1.OrderStatus)).optional().messages({
        'any.only': `Order status must be one of: ${Object.values(enum_1.OrderStatus).join(', ')}`
    }),
    paymentStatus: joi_1.default.string().valid(...Object.values(enum_1.PaymentStatusEnum)).optional().messages({
        'any.only': `Payment status must be one of: ${Object.values(enum_1.PaymentStatusEnum).join(', ')}`
    }),
    quotedPrice: joi_1.default.number().min(0).precision(2).optional().allow(null).messages({
        'number.base': 'Quoted price must be a number',
        'number.min': 'Quoted price cannot be negative',
        'number.precision': 'Quoted price can have at most 2 decimal places'
    }),
    actualPrice: joi_1.default.number().min(0).precision(2).optional().allow(null).messages({
        'number.base': 'Actual price must be a number',
        'number.min': 'Actual price cannot be negative',
        'number.precision': 'Actual price can have at most 2 decimal places'
    }),
    yardId: joi_1.default.string().uuid().optional().allow(null).messages({
        'string.guid': 'Scrap yard ID must be a valid UUID'
    }),
    crewId: joi_1.default.string().uuid().optional().allow(null).messages({
        'string.guid': 'Crew ID must be a valid UUID'
    }),
    routeDistance: joi_1.default.string().max(50).optional().allow(null).messages({
        'string.max': 'Route distance cannot exceed 50 characters'
    }),
    routeDuration: joi_1.default.string().max(50).optional().allow(null).messages({
        'string.max': 'Route duration cannot exceed 50 characters'
    }),
    customerNotes: joi_1.default.string().max(1000).optional().allow(null).messages({
        'string.max': 'Customer notes cannot exceed 1000 characters'
    }),
    adminNotes: joi_1.default.string().max(1000).optional().allow(null).messages({
        'string.max': 'Admin notes cannot exceed 1000 characters'
    }),
    instructions: joi_1.default.string().max(2000).trim().optional().allow(null).messages({
        'string.max': 'Instructions cannot exceed 2000 characters'
    })
});
exports.orderQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    status: joi_1.default.string().valid(...Object.values(enum_1.OrderStatus)).optional(),
    paymentStatus: joi_1.default.string().valid(...Object.values(enum_1.PaymentStatusEnum)).optional(),
    collectorId: joi_1.default.string().uuid().optional(),
    organizationId: joi_1.default.number().integer().positive().optional(),
    dateFrom: joi_1.default.string().isoDate().optional(),
    dateTo: joi_1.default.string().isoDate().optional(),
    location: joi_1.default.string().optional()
});
exports.orderIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required()
});
exports.assignOrderSchema = joi_1.default.object({
    collectorId: joi_1.default.string().uuid().optional(),
    collectorIds: joi_1.default.array().items(joi_1.default.string().uuid()).optional(),
    crewId: joi_1.default.string().uuid().optional(),
    yardId: joi_1.default.string().uuid().optional(),
    routeDistance: joi_1.default.string().optional(),
    routeDuration: joi_1.default.string().optional(),
    startTime: joi_1.default.date().optional(),
    endTime: joi_1.default.date().optional(),
    notes: joi_1.default.string().optional()
});
