"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forUpdateOrganization = exports.forCreateOrganization = void 0;
const joi_1 = __importDefault(require("joi"));
exports.forCreateOrganization = joi_1.default.object({
    name: joi_1.default.string().required().min(2).max(255).messages({
        'string.empty': 'Organization name is required',
        'string.min': 'Organization name must be at least 2 characters',
        'string.max': 'Organization name must not exceed 255 characters',
    }),
    email: joi_1.default.string().optional().allow('').email().messages({
        'string.email': 'Please provide a valid email address',
    }),
    website: joi_1.default.string().optional().allow('').uri().messages({
        'string.uri': 'Please provide a valid website URL',
    }),
    billingAddress: joi_1.default.string().optional().allow('').max(500).messages({
        'string.max': 'Billing address must not exceed 500 characters',
    }),
    latitude: joi_1.default.number().optional().min(-90).max(90).messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
    }),
    longitude: joi_1.default.number().optional().min(-180).max(180).messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
    }),
    countryId: joi_1.default.number().optional().integer().positive().messages({
        'number.integer': 'Invalid country selection',
        'number.positive': 'Invalid country selection',
    }),
});
exports.forUpdateOrganization = joi_1.default.object({
    name: joi_1.default.string().optional().min(2).max(255).messages({
        'string.min': 'Organization name must be at least 2 characters',
        'string.max': 'Organization name must not exceed 255 characters',
    }),
    email: joi_1.default.string().optional().allow('').email().messages({
        'string.email': 'Please provide a valid email address',
    }),
    website: joi_1.default.string().optional().allow('').uri().messages({
        'string.uri': 'Please provide a valid website URL',
    }),
    billingAddress: joi_1.default.string().optional().allow('').max(500).messages({
        'string.max': 'Billing address must not exceed 500 characters',
    }),
    latitude: joi_1.default.number().optional().min(-90).max(90).messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
    }),
    longitude: joi_1.default.number().optional().min(-180).max(180).messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
    }),
    countryId: joi_1.default.number().optional().integer().positive().messages({
        'number.integer': 'Invalid country selection',
        'number.positive': 'Invalid country selection',
    }),
});
