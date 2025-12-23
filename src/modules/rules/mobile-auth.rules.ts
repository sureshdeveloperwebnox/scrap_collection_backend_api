import Joi from 'joi';

// Validation rule for mobile login
export const forMobileLogin = Joi.object({
    identifier: Joi.string()
        .required()
        .messages({
            'string.empty': 'Email or phone number is required',
            'any.required': 'Email or phone number is required'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        })
});

// Validation rule for refresh token
export const forRefreshToken = Joi.object({
    refreshToken: Joi.string()
        .required()
        .messages({
            'string.empty': 'Refresh token is required',
            'any.required': 'Refresh token is required'
        })
});
