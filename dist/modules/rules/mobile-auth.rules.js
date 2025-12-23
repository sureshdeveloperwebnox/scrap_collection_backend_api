"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forRefreshToken = exports.forMobileLogin = void 0;
const joi_1 = __importDefault(require("joi"));
// Validation rule for mobile login
exports.forMobileLogin = joi_1.default.object({
    identifier: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Email or phone number is required',
        'any.required': 'Email or phone number is required'
    }),
    password: joi_1.default.string()
        .min(6)
        .required()
        .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
    })
});
// Validation rule for refresh token
exports.forRefreshToken = joi_1.default.object({
    refreshToken: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Refresh token is required',
        'any.required': 'Refresh token is required'
    })
});
