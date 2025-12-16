"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerUserIdSchema = exports.customerIdSchema = exports.customerQuerySchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const enum_1 = require("../model/enum");
const phone_validator_1 = require("../../utils/phone-validator");
exports.createCustomerSchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Organization ID must be a positive number',
        'any.required': 'Organization ID is required'
    }),
    name: joi_1.default.string().min(2).max(100).required().messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
    }),
    phone: joi_1.default.string().custom(phone_validator_1.phoneCustomValidation, 'phone validation').required().messages({
        'any.required': 'Phone number is required',
        'any.custom': '{{#error.message}}'
    }),
    email: joi_1.default.string().email().optional().messages({
        'string.email': 'Please provide a valid email address'
    }),
    address: joi_1.default.string().max(500).optional().messages({
        'string.max': 'Address cannot exceed 500 characters'
    }),
    latitude: joi_1.default.number().min(-90).max(90).optional(),
    longitude: joi_1.default.number().min(-180).max(180).optional(),
    vehicleType: joi_1.default.string().valid(...Object.values(enum_1.VehicleTypeEnum)).optional().messages({
        'any.only': 'Vehicle type must be one of: CAR, BIKE, TRUCK, BOAT, VAN, SUV'
    }),
    vehicleMake: joi_1.default.string().max(50).optional().messages({
        'string.max': 'Vehicle make cannot exceed 50 characters'
    }),
    vehicleModel: joi_1.default.string().max(50).optional().messages({
        'string.max': 'Vehicle model cannot exceed 50 characters'
    }),
    vehicleNumber: joi_1.default.string().max(50).optional().messages({
        'string.max': 'Vehicle number cannot exceed 50 characters'
    }),
    vehicleYear: joi_1.default.number().integer().min(1900).max(new Date().getFullYear() + 1).optional().messages({
        'number.min': 'Vehicle year must be 1900 or later',
        'number.max': `Vehicle year cannot be later than ${new Date().getFullYear() + 1}`
    }),
    vehicleCondition: joi_1.default.string().valid(...Object.values(enum_1.VehicleConditionEnum)).optional().messages({
        'any.only': 'Vehicle condition must be one of: JUNK, DAMAGED, WRECKED, ACCIDENTAL, FULLY_SCRAP'
    }),
    userId: joi_1.default.string().uuid().optional()
});
exports.updateCustomerSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).optional(),
    phone: joi_1.default.string().custom(phone_validator_1.phoneCustomValidation, 'phone validation').optional().messages({
        'any.custom': '{{#error.message}}'
    }),
    email: joi_1.default.string().email().optional().messages({
        'string.email': 'Please provide a valid email address'
    }),
    address: joi_1.default.string().max(500).optional().messages({
        'string.max': 'Address cannot exceed 500 characters'
    }),
    latitude: joi_1.default.number().min(-90).max(90).optional(),
    longitude: joi_1.default.number().min(-180).max(180).optional(),
    vehicleType: joi_1.default.string().valid(...Object.values(enum_1.VehicleTypeEnum)).optional().messages({
        'any.only': 'Vehicle type must be one of: CAR, BIKE, TRUCK, BOAT, VAN, SUV'
    }),
    vehicleMake: joi_1.default.string().max(50).optional().messages({
        'string.max': 'Vehicle make cannot exceed 50 characters'
    }),
    vehicleModel: joi_1.default.string().max(50).optional().messages({
        'string.max': 'Vehicle model cannot exceed 50 characters'
    }),
    vehicleNumber: joi_1.default.string().max(50).optional().messages({
        'string.max': 'Vehicle number cannot exceed 50 characters'
    }),
    vehicleYear: joi_1.default.number().integer().min(1900).max(new Date().getFullYear() + 1).optional().messages({
        'number.min': 'Vehicle year must be 1900 or later',
        'number.max': `Vehicle year cannot be later than ${new Date().getFullYear() + 1}`
    }),
    vehicleCondition: joi_1.default.string().valid(...Object.values(enum_1.VehicleConditionEnum)).optional().messages({
        'any.only': 'Vehicle condition must be one of: JUNK, DAMAGED, WRECKED, ACCIDENTAL, FULLY_SCRAP'
    }),
    accountStatus: joi_1.default.string().valid(...Object.values(enum_1.CustomerStatus)).optional()
});
exports.customerQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    organizationId: joi_1.default.number().integer().positive().optional(),
    accountStatus: joi_1.default.string().valid(...Object.values(enum_1.CustomerStatus)).optional()
});
exports.customerIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Customer ID must be a valid UUID',
        'any.required': 'Customer ID is required'
    })
});
exports.customerUserIdSchema = joi_1.default.object({
    userId: joi_1.default.string().uuid().required().messages({
        'string.guid': 'User ID must be a valid UUID',
        'any.required': 'User ID is required'
    })
});
