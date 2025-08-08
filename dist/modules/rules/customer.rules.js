"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerUserIdSchema = exports.customerIdSchema = exports.customerQuerySchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createCustomerSchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Organization ID must be a positive number',
        'any.required': 'Organization ID is required'
    }),
    userId: joi_1.default.string().min(1).required().messages({
        'string.empty': 'User ID cannot be empty',
        'any.required': 'User ID is required'
    }),
    address: joi_1.default.string().max(500).optional().messages({
        'string.max': 'Address cannot exceed 500 characters'
    })
});
exports.updateCustomerSchema = joi_1.default.object({
    address: joi_1.default.string().max(500).optional().messages({
        'string.max': 'Address cannot exceed 500 characters'
    })
});
exports.customerQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    organizationId: joi_1.default.number().integer().positive().optional(),
    isActive: joi_1.default.boolean().optional()
});
exports.customerIdSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Customer ID must be a positive number',
        'any.required': 'Customer ID is required'
    })
});
exports.customerUserIdSchema = joi_1.default.object({
    userId: joi_1.default.string().min(1).required().messages({
        'string.empty': 'User ID cannot be empty',
        'any.required': 'User ID is required'
    })
});
