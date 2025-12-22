"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeIdSchema = exports.employeeQuerySchema = exports.updateEmployeeSchema = exports.createEmployeeSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const phone_validator_1 = require("../../utils/phone-validator");
exports.createEmployeeSchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required(),
    fullName: joi_1.default.string().min(2).max(100).required(),
    email: joi_1.default.string().email().required(),
    phone: joi_1.default.string().custom(phone_validator_1.phoneCustomValidation, 'phone validation').required().messages({
        'any.required': 'Phone number is required',
        'any.custom': '{{#error.message}}'
    }),
    roleId: joi_1.default.number().integer().positive().required().messages({
        'any.required': 'Role is required',
        'number.positive': 'Role ID must be a positive number'
    }),
    cityId: joi_1.default.number().integer().positive().optional().messages({
        'number.positive': 'City ID must be a positive number'
    }),
    scrapYardId: joi_1.default.string().uuid().optional().allow(null),
    password: joi_1.default.string().min(6).required().messages({
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 6 characters long'
    })
});
exports.updateEmployeeSchema = joi_1.default.object({
    fullName: joi_1.default.string().min(2).max(100).optional(),
    email: joi_1.default.string().email().optional(),
    phone: joi_1.default.string().custom(phone_validator_1.phoneCustomValidation, 'phone validation').optional().messages({
        'any.custom': '{{#error.message}}'
    }),
    roleId: joi_1.default.number().integer().positive().optional().messages({
        'number.positive': 'Role ID must be a positive number'
    }),
    cityId: joi_1.default.number().integer().positive().optional().allow(null).messages({
        'number.positive': 'City ID must be a positive number'
    }),
    scrapYardId: joi_1.default.string().uuid().optional().allow(null),
    password: joi_1.default.string().min(6).optional(),
    isActive: joi_1.default.boolean().optional(),
    deviceToken: joi_1.default.string().optional()
});
exports.employeeQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    roleId: joi_1.default.number().integer().positive().optional(),
    role: joi_1.default.string().optional(),
    cityId: joi_1.default.number().integer().positive().optional(),
    isActive: joi_1.default.boolean().optional(),
    organizationId: joi_1.default.number().integer().positive().optional()
});
exports.employeeIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required()
});
