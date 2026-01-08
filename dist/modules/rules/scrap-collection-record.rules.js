"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapCollectionRecordIdSchema = exports.scrapCollectionRecordQuerySchema = exports.updateScrapCollectionRecordSchema = exports.createScrapCollectionRecordSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const enum_1 = require("../model/enum");
/**
 * Schema for creating a scrap collection record
 */
exports.createScrapCollectionRecordSchema = {
    body: joi_1.default.object({
        workOrderId: joi_1.default.string().required().messages({
            'any.required': 'Work Order ID is required',
            'string.empty': 'Work Order ID cannot be empty'
        }),
        assignOrderId: joi_1.default.string().uuid().required().messages({
            'any.required': 'Assign Order ID is required',
            'string.guid': 'Invalid Assign Order ID format'
        }),
        customerId: joi_1.default.string().uuid().required().messages({
            'any.required': 'Customer ID is required',
            'string.guid': 'Invalid Customer ID format'
        }),
        scrapCategoryId: joi_1.default.string().uuid().required().messages({
            'any.required': 'Scrap category is required',
            'string.guid': 'Invalid scrap category ID format'
        }),
        scrapNameId: joi_1.default.string().uuid().required().messages({
            'any.required': 'Scrap name is required',
            'string.guid': 'Invalid scrap name ID format'
        }),
        collectorId: joi_1.default.string().uuid().optional(),
        collectionDate: joi_1.default.date().iso().optional().allow(null),
        scrapDescription: joi_1.default.string().min(2).max(1000).required().messages({
            'any.required': 'Scrap description is required',
            'string.min': 'Description must be at least 2 characters long'
        }),
        scrapCondition: joi_1.default.string().valid(...Object.values(enum_1.ScrapConditionEnum)).required().messages({
            'any.required': 'Scrap condition is required',
            'any.only': 'Invalid scrap condition'
        }),
        make: joi_1.default.string().max(100).optional().allow(null, ''),
        model: joi_1.default.string().max(100).optional().allow(null, ''),
        yearOfManufacture: joi_1.default.string().max(10).optional().allow(null, ''),
        weight: joi_1.default.number().min(0).optional().allow(null),
        quantity: joi_1.default.number().min(0).optional().allow(null), // Quantity is optional
        quotedAmount: joi_1.default.number().min(0).required().messages({
            'any.required': 'Quoted amount is required'
        }),
        finalAmount: joi_1.default.number().min(0).required().messages({
            'any.required': 'Final amount is required'
        }),
        photos: joi_1.default.array().items(joi_1.default.string()).optional().allow(null),
        customerSignature: joi_1.default.string().required().messages({
            'any.required': 'Customer signature is required',
            'string.empty': 'Customer signature cannot be empty'
        }),
        collectorSignature: joi_1.default.string().required().messages({
            'any.required': 'Collector signature is required',
            'string.empty': 'Collector signature cannot be empty'
        }),
        collectionStatus: joi_1.default.string().valid(...Object.values(enum_1.CollectionRecordStatus)).optional()
    })
};
/**
 * Schema for updating a scrap collection record
 */
exports.updateScrapCollectionRecordSchema = {
    body: joi_1.default.object({
        workOrderId: joi_1.default.string().optional().allow(null, ''),
        assignOrderId: joi_1.default.string().uuid().optional().allow(null, ''),
        customerId: joi_1.default.string().uuid().optional().allow(null, ''),
        scrapCategoryId: joi_1.default.string().uuid().optional().allow(null, ''),
        scrapNameId: joi_1.default.string().uuid().optional().allow(null, ''),
        collectionDate: joi_1.default.date().iso().optional().allow(null),
        scrapDescription: joi_1.default.string().min(2).max(1000).optional().allow(null, ''),
        scrapCondition: joi_1.default.string().valid(...Object.values(enum_1.ScrapConditionEnum)).optional().allow(null),
        make: joi_1.default.string().max(100).optional().allow(null, ''),
        model: joi_1.default.string().max(100).optional().allow(null, ''),
        yearOfManufacture: joi_1.default.string().max(10).optional().allow(null, ''),
        weight: joi_1.default.number().min(0).optional().allow(null),
        quantity: joi_1.default.number().min(0).optional().allow(null),
        quotedAmount: joi_1.default.number().min(0).optional().allow(null),
        finalAmount: joi_1.default.number().min(0).optional().allow(null),
        photos: joi_1.default.array().items(joi_1.default.string()).optional().allow(null),
        customerSignature: joi_1.default.string().optional().allow(null, ''),
        collectorSignature: joi_1.default.string().optional().allow(null, ''),
        collectionStatus: joi_1.default.string().valid(...Object.values(enum_1.CollectionRecordStatus)).optional()
    })
};
/**
 * Schema for collection record query parameters
 */
exports.scrapCollectionRecordQuerySchema = {
    query: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(20),
        collectionStatus: joi_1.default.alternatives().try(joi_1.default.string().valid(...Object.values(enum_1.CollectionRecordStatus)), joi_1.default.array().items(joi_1.default.string().valid(...Object.values(enum_1.CollectionRecordStatus)))).optional(),
        workOrderId: joi_1.default.string().optional(),
        customerId: joi_1.default.string().uuid().optional(),
        scrapCategoryId: joi_1.default.string().uuid().optional(),
        dateFrom: joi_1.default.string().isoDate().optional(),
        dateTo: joi_1.default.string().isoDate().optional(),
        search: joi_1.default.string().max(100).optional(),
        sortBy: joi_1.default.string().valid('collectionDate', 'finalAmount', 'createdAt').default('createdAt'),
        sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc')
    })
};
/**
 * Schema for collection record ID
 */
exports.scrapCollectionRecordIdSchema = {
    params: joi_1.default.object({
        id: joi_1.default.string().uuid().required().messages({
            'any.required': 'Collection record ID is required',
            'string.guid': 'Invalid collection record ID format'
        })
    })
};
