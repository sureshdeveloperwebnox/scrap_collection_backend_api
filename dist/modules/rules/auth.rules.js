"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forProfileUpdate = exports.forGoogleSignIn = exports.forSignUp = exports.forSignIn = void 0;
const joi_1 = __importDefault(require("joi"));
const phone_validator_1 = require("../../utils/phone-validator");
exports.forSignIn = {
    body: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: joi_1.default.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'password strength')
            .required()
            .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.name': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
            'any.required': 'Password is required'
        }),
        role: joi_1.default.string().required().messages({
            'any.required': 'Role is required'
        })
    })
};
exports.forSignUp = {
    body: joi_1.default.object({
        name: joi_1.default.string().required().messages({
            'any.required': 'Name is required'
        }),
        address: joi_1.default.string().required().messages({
            'any.required': 'Address is required'
        }),
        phone: joi_1.default.string().custom(phone_validator_1.phoneCustomValidation, 'phone validation').required().messages({
            'any.required': 'Phone is required',
            'any.custom': '{{#error.message}}'
        }),
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: joi_1.default.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'password strength')
            .required()
            .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.name': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
            'any.required': 'Password is required'
        }),
        countryId: joi_1.default.number().optional().messages({
            'number.base': 'Country ID must be a number'
        })
    })
};
exports.forGoogleSignIn = {
    body: joi_1.default.object({
        idToken: joi_1.default.string().required().messages({
            'any.required': 'Google ID token is required'
        })
    })
};
exports.forProfileUpdate = {
    body: joi_1.default.object({
        fullName: joi_1.default.string().optional().allow(''),
        firstName: joi_1.default.string().optional().allow(''),
        lastName: joi_1.default.string().optional().allow(''),
        email: joi_1.default.string().email().optional(),
        phone: joi_1.default.string().custom(phone_validator_1.phoneCustomValidation, 'phone validation').optional().allow(''),
        profileImg: joi_1.default.string().optional().allow('')
    })
};
