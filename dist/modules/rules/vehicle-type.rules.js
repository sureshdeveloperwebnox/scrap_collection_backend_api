"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleTypeIdSchema = exports.vehicleTypeQuerySchema = exports.updateVehicleTypeSchema = exports.createVehicleTypeSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createVehicleTypeSchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Organization ID must be a positive number',
        'any.required': 'Organization ID is required'
    }),
    name: joi_1.default.string().min(2).max(100).required().messages({
        'string.min': 'Vehicle type name must be at least 2 characters long',
        'string.max': 'Vehicle type name cannot exceed 100 characters',
        'any.required': 'Vehicle type name is required'
    }),
    description: joi_1.default.string().max(500).optional().messages({
        'string.max': 'Description cannot exceed 500 characters'
    }),
    isActive: joi_1.default.boolean().default(true).messages({
        'boolean.base': 'isActive must be a boolean value'
    })
});
exports.updateVehicleTypeSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).optional().messages({
        'string.min': 'Vehicle type name must be at least 2 characters long',
        'string.max': 'Vehicle type name cannot exceed 100 characters'
    }),
    description: joi_1.default.string().max(500).optional().messages({
        'string.max': 'Description cannot exceed 500 characters'
    }),
    isActive: joi_1.default.boolean().optional().messages({
        'boolean.base': 'isActive must be a boolean value'
    })
});
exports.vehicleTypeQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    isActive: joi_1.default.boolean().optional(),
    organizationId: joi_1.default.number().integer().positive().optional()
});
exports.vehicleTypeIdSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Vehicle type ID must be a positive number',
        'any.required': 'Vehicle type ID is required'
    })
});
