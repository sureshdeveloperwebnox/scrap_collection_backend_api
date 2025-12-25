import Joi from 'joi';

export const forCreateOrganization = Joi.object({
    name: Joi.string().required().min(2).max(255).messages({
        'string.empty': 'Organization name is required',
        'string.min': 'Organization name must be at least 2 characters',
        'string.max': 'Organization name must not exceed 255 characters',
    }),
    email: Joi.string().optional().allow('').email().messages({
        'string.email': 'Please provide a valid email address',
    }),
    website: Joi.string().optional().allow('').uri().messages({
        'string.uri': 'Please provide a valid website URL',
    }),
    billingAddress: Joi.string().optional().allow('').max(500).messages({
        'string.max': 'Billing address must not exceed 500 characters',
    }),
    latitude: Joi.number().optional().min(-90).max(90).messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
    }),
    longitude: Joi.number().optional().min(-180).max(180).messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
    }),
    countryId: Joi.number().optional().integer().positive().messages({
        'number.integer': 'Invalid country selection',
        'number.positive': 'Invalid country selection',
    }),
});

export const forUpdateOrganization = Joi.object({
    name: Joi.string().optional().min(2).max(255).messages({
        'string.min': 'Organization name must be at least 2 characters',
        'string.max': 'Organization name must not exceed 255 characters',
    }),
    email: Joi.string().optional().allow('').email().messages({
        'string.email': 'Please provide a valid email address',
    }),
    website: Joi.string().optional().allow('').uri().messages({
        'string.uri': 'Please provide a valid website URL',
    }),
    billingAddress: Joi.string().optional().allow('').max(500).messages({
        'string.max': 'Billing address must not exceed 500 characters',
    }),
    latitude: Joi.number().optional().min(-90).max(90).messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
    }),
    longitude: Joi.number().optional().min(-180).max(180).messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
    }),
    countryId: Joi.number().optional().integer().positive().messages({
        'number.integer': 'Invalid country selection',
        'number.positive': 'Invalid country selection',
    }),
});
