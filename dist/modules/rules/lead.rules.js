"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLeadSchema = exports.leadIdSchema = exports.leadQuerySchema = exports.updateLeadSchema = exports.createLeadSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const enum_1 = require("../model/enum");
const phone_validator_1 = require("../../utils/phone-validator");
exports.createLeadSchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Organization ID must be a positive number',
        'any.required': 'Organization ID is required'
    }),
    fullName: joi_1.default.string().min(2).max(100).required().messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name cannot exceed 100 characters',
        'any.required': 'Full name is required'
    }),
    phone: joi_1.default.string().custom(phone_validator_1.phoneCustomValidation, 'phone validation').required().messages({
        'any.required': 'Phone number is required',
        'any.custom': '{{#error.message}}'
    }),
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    vehicleType: joi_1.default.string().valid(...Object.values(enum_1.VehicleTypeEnum)).required().messages({
        'any.only': 'Vehicle type must be one of: CAR, BIKE, TRUCK, BOAT, VAN, SUV',
        'any.required': 'Vehicle type is required'
    }),
    vehicleMake: joi_1.default.string().max(50).optional(),
    vehicleModel: joi_1.default.string().max(50).optional(),
    vehicleYear: joi_1.default.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
    vehicleCondition: joi_1.default.string().valid(...Object.values(enum_1.VehicleConditionEnum)).required().messages({
        'any.only': 'Vehicle condition must be one of: JUNK, DAMAGED, WRECKED, ACCIDENTAL, FULLY_SCRAP',
        'any.required': 'Vehicle condition is required'
    }),
    locationAddress: joi_1.default.string().min(5).max(500).required().messages({
        'string.min': 'Location address must be at least 5 characters long',
        'string.max': 'Location address cannot exceed 500 characters',
        'any.required': 'Location address is required'
    }),
    latitude: joi_1.default.number().min(-90).max(90).optional(),
    longitude: joi_1.default.number().min(-180).max(180).optional(),
    leadSource: joi_1.default.string().valid(...Object.values(enum_1.LeadSourceEnum)).required().messages({
        'any.only': 'Lead source must be one of: WEBFORM, CHATBOT, CALL, MANUAL',
        'any.required': 'Lead source is required'
    }),
    photos: joi_1.default.array().items(joi_1.default.string().uri()).optional(),
    notes: joi_1.default.string().optional(),
    customerId: joi_1.default.string().uuid().optional()
});
exports.updateLeadSchema = joi_1.default.object({
    fullName: joi_1.default.string().min(2).max(100).optional(),
    phone: joi_1.default.string().custom(phone_validator_1.phoneCustomValidation, 'phone validation').optional().messages({
        'any.custom': '{{#error.message}}'
    }),
    email: joi_1.default.string().email().optional().messages({
        'string.email': 'Please provide a valid email address'
    }),
    vehicleType: joi_1.default.string().valid(...Object.values(enum_1.VehicleTypeEnum)).optional(),
    vehicleMake: joi_1.default.string().max(50).optional(),
    vehicleModel: joi_1.default.string().max(50).optional(),
    vehicleYear: joi_1.default.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
    vehicleCondition: joi_1.default.string().valid(...Object.values(enum_1.VehicleConditionEnum)).optional(),
    locationAddress: joi_1.default.string().optional(),
    latitude: joi_1.default.number().min(-90).max(90).optional(),
    longitude: joi_1.default.number().min(-180).max(180).optional(),
    leadSource: joi_1.default.string().valid(...Object.values(enum_1.LeadSourceEnum)).optional(),
    photos: joi_1.default.array().items(joi_1.default.string().uri()).optional(),
    notes: joi_1.default.string().optional(),
    status: joi_1.default.string().valid(...Object.values(enum_1.LeadStatus)).optional()
});
exports.leadQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    status: joi_1.default.string().valid(...Object.values(enum_1.LeadStatus)).optional(),
    vehicleType: joi_1.default.string().valid(...Object.values(enum_1.VehicleTypeEnum)).optional().messages({
        'any.only': 'Vehicle type must be one of: CAR, BIKE, TRUCK, BOAT, VAN, SUV'
    }),
    vehicleCondition: joi_1.default.string().valid(...Object.values(enum_1.VehicleConditionEnum)).optional().messages({
        'any.only': 'Vehicle condition must be one of: JUNK, DAMAGED, WRECKED, ACCIDENTAL, FULLY_SCRAP'
    }),
    leadSource: joi_1.default.string().valid(...Object.values(enum_1.LeadSourceEnum)).optional().messages({
        'any.only': 'Lead source must be one of: WEBFORM, CHATBOT, CALL, MANUAL'
    }),
    organizationId: joi_1.default.number().integer().positive().optional(),
    dateFrom: joi_1.default.string().isoDate().optional(),
    dateTo: joi_1.default.string().isoDate().optional(),
    sortBy: joi_1.default.string().valid('fullName', 'phone', 'email', 'status', 'createdAt', 'updatedAt').optional().default('createdAt'),
    sortOrder: joi_1.default.string().valid('asc', 'desc').optional().default('desc')
});
exports.leadIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Lead ID must be a valid UUID',
        'any.required': 'Lead ID is required'
    })
});
exports.convertLeadSchema = joi_1.default.object({
    quotedPrice: joi_1.default.number().positive().optional(),
    pickupTime: joi_1.default.date().optional(),
    assignedCollectorId: joi_1.default.string().uuid().optional(),
    yardId: joi_1.default.string().uuid().optional(),
    customerNotes: joi_1.default.string().optional(),
    adminNotes: joi_1.default.string().optional()
});
