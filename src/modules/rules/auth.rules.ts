import Joi from 'joi';
import { phoneCustomValidation } from '../../utils/phone-validator';

export const forSignIn = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
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
    address: Joi.string().required().messages({
      'any.required': 'Address is required'
    }),
    firstName: Joi.string().required().messages({
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
      'any.required': 'Last name is required'
    }),
    phone: Joi.string().custom(phoneCustomValidation, 'phone validation').required().messages({
      'any.required': 'Phone is required',
      'any.custom': '{{#error.message}}'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    }),
    countryId: Joi.number().required().messages({
      'any.required': 'Country is required'
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