"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forSignUp = exports.forSignIn = void 0;
const joi_1 = __importDefault(require("joi"));
exports.forSignIn = {
    body: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: joi_1.default.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters',
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
        firstName: joi_1.default.string().required().messages({
            'any.required': 'First name is required'
        }),
        lastName: joi_1.default.string().required().messages({
            'any.required': 'Last name is required'
        }),
        phone: joi_1.default.string().required().messages({
            'any.required': 'Phone is required'
        }),
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: joi_1.default.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required'
        }),
        countryId: joi_1.default.number().required().messages({
            'any.required': 'Country is required'
        })
    })
};
