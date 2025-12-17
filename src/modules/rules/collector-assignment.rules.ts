import Joi from 'joi';

export const createCollectorAssignmentSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required().messages({
    'number.positive': 'Organization ID must be a positive number',
    'any.required': 'Organization ID is required'
  }),
  collectorId: Joi.string().uuid().optional().allow(null).messages({
    'string.guid': 'Collector ID must be a valid UUID'
  }),
  crewId: Joi.string().uuid().optional().allow(null).messages({
    'string.guid': 'Crew ID must be a valid UUID'
  }),
  vehicleNameId: Joi.string().uuid().optional().allow(null).messages({
    'string.guid': 'Vehicle name ID must be a valid UUID'
  }),
  cityId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.positive': 'City ID must be a positive number'
  }),
  scrapYardId: Joi.string().uuid().optional().allow(null).messages({
    'string.guid': 'Scrap yard ID must be a valid UUID'
  }),
  isActive: Joi.boolean().default(true).messages({
    'boolean.base': 'isActive must be a boolean value'
  })
}).or('vehicleNameId', 'cityId', 'scrapYardId').or('collectorId', 'crewId').messages({
  'object.missing': 'Configuration error: check validation rules'
});

export const updateCollectorAssignmentSchema = Joi.object({
  vehicleNameId: Joi.string().uuid().optional().allow(null).messages({
    'string.guid': 'Vehicle name ID must be a valid UUID'
  }),
  cityId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.positive': 'City ID must be a positive number'
  }),
  scrapYardId: Joi.string().uuid().optional().allow(null).messages({
    'string.guid': 'Scrap yard ID must be a valid UUID'
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be a boolean value'
  })
});

export const collectorAssignmentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  isActive: Joi.boolean().optional(),
  organizationId: Joi.number().integer().positive().optional(),
  collectorId: Joi.string().uuid().optional(),
  crewId: Joi.string().uuid().optional(),
  vehicleNameId: Joi.string().uuid().optional(),
  cityId: Joi.number().integer().positive().optional(),
  scrapYardId: Joi.string().uuid().optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

export const collectorAssignmentIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Collector assignment ID must be a valid UUID',
    'any.required': 'Collector assignment ID is required'
  })
});
