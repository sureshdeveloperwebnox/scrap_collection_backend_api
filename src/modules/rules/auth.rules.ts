import Joi from 'joi';
import { phoneCustomValidation } from '../../utils/phone-validator';

export const forSignIn = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'password strength')
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.name': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
        'any.required': 'Password is required'
      }),
    role: Joi.string().required().messages({
      'any.required': 'Role is required'
    })
  })
};

export const forSignUp = {
  body: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Name is required'
    }),
    address: Joi.string().optional().allow(''),
    phone: Joi.string().custom(phoneCustomValidation, 'phone validation').required().messages({
      'any.required': 'Phone is required',
      'any.custom': '{{#error.message}}'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'password strength')
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.name': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
        'any.required': 'Password is required'
      }),
    countryId: Joi.number().optional().messages({
      'number.base': 'Country ID must be a number'
    })
  })
};

export const forGoogleSignIn = {
  body: Joi.object({
    idToken: Joi.string().required().messages({
      'any.required': 'Google ID token is required'
    })
  })
};
export const forProfileUpdate = {
  body: Joi.object({
    fullName: Joi.string().optional().allow(''),
    firstName: Joi.string().optional().allow(''),
    lastName: Joi.string().optional().allow(''),
    email: Joi.string().email().optional(),
    phone: Joi.string().custom(phoneCustomValidation, 'phone validation').optional().allow(''),
    profileImg: Joi.string().optional().allow('')
  })
};
