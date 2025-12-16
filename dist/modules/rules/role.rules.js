"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleIdSchema = exports.roleQuerySchema = exports.updateRoleSchema = exports.createRoleSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createRoleSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required().messages({
        'string.min': 'Role name must be at least 2 characters long',
        'string.max': 'Role name cannot exceed 100 characters',
        'any.required': 'Role name is required'
    }),
    description: joi_1.default.string().max(500).optional().allow('', null).messages({
        'string.max': 'Description cannot exceed 500 characters'
    }),
    isActive: joi_1.default.boolean().default(true).messages({
        'boolean.base': 'isActive must be a boolean value'
    })
});
exports.updateRoleSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).optional().messages({
        'string.min': 'Role name must be at least 2 characters long',
        'string.max': 'Role name cannot exceed 100 characters'
    }),
    description: joi_1.default.string().max(500).optional().allow('', null).messages({
        'string.max': 'Description cannot exceed 500 characters'
    }),
    isActive: joi_1.default.boolean().optional().messages({
        'boolean.base': 'isActive must be a boolean value'
    })
});
exports.roleQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    isActive: joi_1.default.boolean().optional(),
    sortBy: joi_1.default.string().valid('name', 'isActive', 'createdAt', 'updatedAt').optional().default('createdAt'),
    sortOrder: joi_1.default.string().valid('asc', 'desc').optional().default('desc')
});
exports.roleIdSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Role ID must be a positive number',
        'any.required': 'Role ID is required'
    })
});
