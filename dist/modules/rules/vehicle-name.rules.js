"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleNameIdSchema = exports.vehicleNameQuerySchema = exports.updateVehicleNameSchema = exports.createVehicleNameSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createVehicleNameSchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Organization ID must be a positive number',
        'any.required': 'Organization ID is required'
    }),
    name: joi_1.default.string().min(2).max(100).required().messages({
        'string.min': 'Vehicle name must be at least 2 characters long',
        'string.max': 'Vehicle name cannot exceed 100 characters',
        'any.required': 'Vehicle name is required'
    }),
    vehicleTypeId: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Vehicle type ID must be a positive number',
        'any.required': 'Vehicle type ID is required'
    }),
    scrapYardId: joi_1.default.string().uuid().optional().messages({
        'string.guid': 'Scrap yard ID must be a valid UUID'
    }),
    isActive: joi_1.default.boolean().default(true).messages({
        'boolean.base': 'isActive must be a boolean value'
    }),
    vehicleNumber: joi_1.default.string().max(20).optional().allow(null, ''),
    make: joi_1.default.string().max(50).optional().allow(null, ''),
    model: joi_1.default.string().max(50).optional().allow(null, ''),
    year: joi_1.default.number().integer().min(1900).max(new Date().getFullYear() + 1).optional().allow(null)
});
exports.updateVehicleNameSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).optional().messages({
        'string.min': 'Vehicle name must be at least 2 characters long',
        'string.max': 'Vehicle name cannot exceed 100 characters'
    }),
    vehicleTypeId: joi_1.default.number().integer().positive().optional().messages({
        'number.positive': 'Vehicle type ID must be a positive number'
    }),
    scrapYardId: joi_1.default.string().uuid().optional().messages({
        'string.guid': 'Scrap yard ID must be a valid UUID'
    }),
    isActive: joi_1.default.boolean().optional().messages({
        'boolean.base': 'isActive must be a boolean value'
    }),
    vehicleNumber: joi_1.default.string().max(20).optional().allow(null, ''),
    make: joi_1.default.string().max(50).optional().allow(null, ''),
    model: joi_1.default.string().max(50).optional().allow(null, ''),
    year: joi_1.default.number().integer().min(1900).max(new Date().getFullYear() + 1).optional().allow(null)
});
exports.vehicleNameQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    isActive: joi_1.default.boolean().optional(),
    organizationId: joi_1.default.number().integer().positive().optional(),
    vehicleTypeId: joi_1.default.number().integer().positive().optional(),
    scrapYardId: joi_1.default.string().uuid().optional(),
    sortBy: joi_1.default.string().valid('name', 'isActive', 'createdAt', 'updatedAt').optional().default('createdAt'),
    sortOrder: joi_1.default.string().valid('asc', 'desc').optional().default('desc')
});
exports.vehicleNameIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Vehicle name ID must be a valid UUID',
        'any.required': 'Vehicle name ID is required'
    })
});
