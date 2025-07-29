// src/rules/hello.rules.ts
import Joi from 'joi';

export const helloQueryValidation = {
  query: Joi.object({
    name: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    })
  })
};