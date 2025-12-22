"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectorAssignmentIdSchema = exports.collectorAssignmentQuerySchema = exports.updateCollectorAssignmentSchema = exports.createCollectorAssignmentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createCollectorAssignmentSchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required().messages({
        'number.positive': 'Organization ID must be a positive number',
        'any.required': 'Organization ID is required'
    }),
    collectorId: joi_1.default.string().uuid().optional().allow(null).messages({
        'string.guid': 'Collector ID must be a valid UUID'
    }),
    crewId: joi_1.default.string().uuid().optional().allow(null).messages({
        'string.guid': 'Crew ID must be a valid UUID'
    }),
    vehicleNameId: joi_1.default.string().uuid().optional().allow(null).messages({
        'string.guid': 'Vehicle name ID must be a valid UUID'
    }),
    cityId: joi_1.default.number().integer().positive().optional().allow(null).messages({
        'number.positive': 'City ID must be a positive number'
    }),
    scrapYardId: joi_1.default.string().uuid().optional().allow(null).messages({
        'string.guid': 'Scrap yard ID must be a valid UUID'
    }),
    isActive: joi_1.default.boolean().default(true).messages({
        'boolean.base': 'isActive must be a boolean value'
    })
}).or('vehicleNameId', 'cityId', 'scrapYardId').or('collectorId', 'crewId').messages({
    'object.missing': 'Configuration error: check validation rules'
});
exports.updateCollectorAssignmentSchema = joi_1.default.object({
    vehicleNameId: joi_1.default.string().uuid().optional().allow(null).messages({
        'string.guid': 'Vehicle name ID must be a valid UUID'
    }),
    cityId: joi_1.default.number().integer().positive().optional().allow(null).messages({
        'number.positive': 'City ID must be a positive number'
    }),
    scrapYardId: joi_1.default.string().uuid().optional().allow(null).messages({
        'string.guid': 'Scrap yard ID must be a valid UUID'
    }),
    isActive: joi_1.default.boolean().optional().messages({
        'boolean.base': 'isActive must be a boolean value'
    })
});
exports.collectorAssignmentQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    isActive: joi_1.default.boolean().optional(),
    organizationId: joi_1.default.number().integer().positive().optional(),
    collectorId: joi_1.default.string().uuid().optional(),
    crewId: joi_1.default.string().uuid().optional(),
    vehicleNameId: joi_1.default.string().uuid().optional(),
    cityId: joi_1.default.number().integer().positive().optional(),
    scrapYardId: joi_1.default.string().uuid().optional(),
    sortBy: joi_1.default.string().valid('createdAt', 'updatedAt').optional().default('createdAt'),
    sortOrder: joi_1.default.string().valid('asc', 'desc').optional().default('desc')
});
exports.collectorAssignmentIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Collector assignment ID must be a valid UUID',
        'any.required': 'Collector assignment ID is required'
    })
});
