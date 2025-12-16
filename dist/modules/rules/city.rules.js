"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cityIdSchema = exports.cityQuerySchema = exports.updateCitySchema = exports.createCitySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createCitySchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required().messages({
        'string.min': 'City name must be at least 2 characters long',
        'string.max': 'City name cannot exceed 100 characters',
        'any.required': 'City name is required'
    }),
    latitude: joi_1.default.number().min(-90).max(90).required().messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
        'any.required': 'Latitude is required'
    }),
    longitude: joi_1.default.number().min(-180).max(180).required().messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
        'any.required': 'Longitude is required'
    }),
    isActive: joi_1.default.boolean().default(true).messages({
        'boolean.base': 'isActive must be a boolean value'
    })
});
exports.updateCitySchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).optional().messages({
        'string.min': 'City name must be at least 2 characters long',
        'string.max': 'City name cannot exceed 100 characters'
    }),
    latitude: joi_1.default.number().min(-90).max(90).optional().messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90'
    }),
    longitude: joi_1.default.number().min(-180).max(180).optional().messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180'
    }),
    isActive: joi_1.default.boolean().optional().messages({
        'boolean.base': 'isActive must be a boolean value'
    })
});
exports.cityQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    isActive: joi_1.default.boolean().optional(),
    sortBy: joi_1.default.string().valid('name', 'isActive', 'createdAt', 'updatedAt').optional().default('createdAt'),
    sortOrder: joi_1.default.string().valid('asc', 'desc').optional().default('desc')
});
exports.cityIdSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'City ID must be a positive number',
        'any.required': 'City ID is required'
    })
});
