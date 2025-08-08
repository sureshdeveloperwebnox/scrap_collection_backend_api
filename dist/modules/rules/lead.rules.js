"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLeadSchema = exports.leadIdSchema = exports.leadQuerySchema = exports.updateLeadSchema = exports.createLeadSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const enum_1 = require("../model/enum");
exports.createLeadSchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Organization ID must be a positive number',
        'any.required': 'Organization ID is required'
    }),
    customerId: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Customer ID must be a positive number',
        'any.required': 'Customer ID is required'
    }),
    name: joi_1.default.string().min(2).max(100).required().messages({
        'string.min': 'Lead name must be at least 2 characters long',
        'string.max': 'Lead name cannot exceed 100 characters',
        'any.required': 'Lead name is required'
    }),
    contact: joi_1.default.string().min(10).max(20).required().messages({
        'string.min': 'Contact number must be at least 10 characters long',
        'string.max': 'Contact number cannot exceed 20 characters',
        'any.required': 'Contact number is required'
    }),
    email: joi_1.default.string().email().optional().messages({
        'string.email': 'Please provide a valid email address'
    }),
    location: joi_1.default.string().max(255).optional().messages({
        'string.max': 'Location cannot exceed 255 characters'
    }),
    vehicleTypeId: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Vehicle type ID must be a positive number',
        'any.required': 'Vehicle type ID is required'
    }),
    scrapCategory: joi_1.default.string().valid(...Object.values(enum_1.ScrapCategory)).required().messages({
        'any.only': 'Scrap category must be one of: JUNK, ACCIDENT_DAMAGED, FULLY_SCRAP',
        'any.required': 'Scrap category is required'
    })
});
exports.updateLeadSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).optional().messages({
        'string.min': 'Lead name must be at least 2 characters long',
        'string.max': 'Lead name cannot exceed 100 characters'
    }),
    contact: joi_1.default.string().min(10).max(20).optional().messages({
        'string.min': 'Contact number must be at least 10 characters long',
        'string.max': 'Contact number cannot exceed 20 characters'
    }),
    email: joi_1.default.string().email().optional().messages({
        'string.email': 'Please provide a valid email address'
    }),
    location: joi_1.default.string().max(255).optional().messages({
        'string.max': 'Location cannot exceed 255 characters'
    }),
    vehicleTypeId: joi_1.default.number().integer().positive().optional().messages({
        'number.positive': 'Vehicle type ID must be a positive number'
    }),
    scrapCategory: joi_1.default.string().valid(...Object.values(enum_1.ScrapCategory)).optional().messages({
        'any.only': 'Scrap category must be one of: JUNK, ACCIDENT_DAMAGED, FULLY_SCRAP'
    }),
    status: joi_1.default.string().valid(...Object.values(enum_1.LeadStatus)).optional().messages({
        'any.only': 'Status must be one of: PENDING, CONVERTED, REJECTED'
    })
});
exports.leadQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    status: joi_1.default.string().valid(...Object.values(enum_1.LeadStatus)).optional(),
    scrapCategory: joi_1.default.string().valid(...Object.values(enum_1.ScrapCategory)).optional(),
    organizationId: joi_1.default.number().integer().positive().optional(),
    customerId: joi_1.default.number().integer().positive().optional()
});
exports.leadIdSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Lead ID must be a positive number',
        'any.required': 'Lead ID is required'
    })
});
exports.convertLeadSchema = joi_1.default.object({
    status: joi_1.default.string().valid(enum_1.LeadStatus.CONVERTED, enum_1.LeadStatus.REJECTED).required().messages({
        'any.only': 'Status must be either CONVERTED or REJECTED',
        'any.required': 'Status is required'
    })
});
