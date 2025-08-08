"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countryCodeSchema = exports.countryIdSchema = exports.countryQuerySchema = exports.updateCountrySchema = exports.createCountrySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createCountrySchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required().messages({
        'string.min': 'Country name must be at least 2 characters long',
        'string.max': 'Country name cannot exceed 100 characters',
        'any.required': 'Country name is required'
    }),
    currency: joi_1.default.string().required().messages({
        'any.required': 'Currency is required'
    }),
    isActive: joi_1.default.boolean().optional()
});
exports.updateCountrySchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).optional().messages({
        'string.min': 'Country name must be at least 2 characters long',
        'string.max': 'Country name cannot exceed 100 characters'
    }),
    currency: joi_1.default.string().optional().messages({
        'any.required': 'Currency is required'
    }),
    isActive: joi_1.default.boolean().optional()
});
exports.countryQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    isActive: joi_1.default.boolean().optional()
});
exports.countryIdSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Country ID must be a positive number',
        'any.required': 'Country ID is required'
    })
});
exports.countryCodeSchema = joi_1.default.object({
    code: joi_1.default.string().length(2).uppercase().required().messages({
        'string.length': 'Country code must be exactly 2 characters',
        'any.required': 'Country code is required'
    })
});
