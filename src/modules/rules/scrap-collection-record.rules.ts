import Joi from 'joi';
import { ScrapConditionEnum, CollectionRecordStatus } from '../model/enum';

/**
 * Schema for creating a scrap collection record
 */
export const createScrapCollectionRecordSchema = {
    body: Joi.object({
        workOrderId: Joi.string().required().messages({
            'any.required': 'Work Order ID is required',
            'string.empty': 'Work Order ID cannot be empty'
        }),
        assignOrderId: Joi.string().uuid().required().messages({
            'any.required': 'Assign Order ID is required',
            'string.guid': 'Invalid Assign Order ID format'
        }),
        customerId: Joi.string().uuid().required().messages({
            'any.required': 'Customer ID is required',
            'string.guid': 'Invalid Customer ID format'
        }),
        scrapCategoryId: Joi.string().uuid().required().messages({
            'any.required': 'Scrap category is required',
            'string.guid': 'Invalid scrap category ID format'
        }),
        scrapNameId: Joi.string().uuid().required().messages({
            'any.required': 'Scrap name is required',
            'string.guid': 'Invalid scrap name ID format'
        }),
        collectorId: Joi.string().uuid().optional(),
        collectionDate: Joi.date().iso().optional().allow(null),
        scrapDescription: Joi.string().min(2).max(1000).required().messages({
            'any.required': 'Scrap description is required',
            'string.min': 'Description must be at least 2 characters long'
        }),
        scrapCondition: Joi.string().valid(...Object.values(ScrapConditionEnum)).required().messages({
            'any.required': 'Scrap condition is required',
            'any.only': 'Invalid scrap condition'
        }),
        make: Joi.string().max(100).optional().allow(null, ''),
        model: Joi.string().max(100).optional().allow(null, ''),
        yearOfManufacture: Joi.string().max(10).optional().allow(null, ''),
        weight: Joi.number().min(0).optional().allow(null),
        quantity: Joi.number().min(0).optional().allow(null), // Quantity is optional
        quotedAmount: Joi.number().min(0).required().messages({
            'any.required': 'Quoted amount is required'
        }),
        finalAmount: Joi.number().min(0).required().messages({
            'any.required': 'Final amount is required'
        }),
        photos: Joi.array().items(Joi.string()).optional().allow(null),
        customerSignature: Joi.string().required().messages({
            'any.required': 'Customer signature is required',
            'string.empty': 'Customer signature cannot be empty'
        }),
        collectorSignature: Joi.string().required().messages({
            'any.required': 'Collector signature is required',
            'string.empty': 'Collector signature cannot be empty'
        }),
        collectionStatus: Joi.string().valid(...Object.values(CollectionRecordStatus)).optional()
    })
};

/**
 * Schema for updating a scrap collection record
 */
export const updateScrapCollectionRecordSchema = {
    body: Joi.object({
        workOrderId: Joi.string().optional().allow(null, ''),
        assignOrderId: Joi.string().uuid().optional().allow(null, ''),
        customerId: Joi.string().uuid().optional().allow(null, ''),
        scrapCategoryId: Joi.string().uuid().optional().allow(null, ''),
        scrapNameId: Joi.string().uuid().optional().allow(null, ''),
        collectionDate: Joi.date().iso().optional().allow(null),
        scrapDescription: Joi.string().min(2).max(1000).optional().allow(null, ''),
        scrapCondition: Joi.string().valid(...Object.values(ScrapConditionEnum)).optional().allow(null),
        make: Joi.string().max(100).optional().allow(null, ''),
        model: Joi.string().max(100).optional().allow(null, ''),
        yearOfManufacture: Joi.string().max(10).optional().allow(null, ''),
        weight: Joi.number().min(0).optional().allow(null),
        quantity: Joi.number().min(0).optional().allow(null),
        quotedAmount: Joi.number().min(0).optional().allow(null),
        finalAmount: Joi.number().min(0).optional().allow(null),
        photos: Joi.array().items(Joi.string()).optional().allow(null),
        customerSignature: Joi.string().optional().allow(null, ''),
        collectorSignature: Joi.string().optional().allow(null, ''),
        collectionStatus: Joi.string().valid(...Object.values(CollectionRecordStatus)).optional()
    })
};

/**
 * Schema for collection record query parameters
 */
export const scrapCollectionRecordQuerySchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        collectionStatus: Joi.alternatives().try(
            Joi.string().valid(...Object.values(CollectionRecordStatus)),
            Joi.array().items(Joi.string().valid(...Object.values(CollectionRecordStatus)))
        ).optional(),
        workOrderId: Joi.string().optional(),
        customerId: Joi.string().uuid().optional(),
        scrapCategoryId: Joi.string().uuid().optional(),
        dateFrom: Joi.string().isoDate().optional(),
        dateTo: Joi.string().isoDate().optional(),
        search: Joi.string().max(100).optional(),
        sortBy: Joi.string().valid('collectionDate', 'finalAmount', 'createdAt').default('createdAt'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
};

/**
 * Schema for collection record ID
 */
export const scrapCollectionRecordIdSchema = {
    params: Joi.object({
        id: Joi.string().uuid().required().messages({
            'any.required': 'Collection record ID is required',
            'string.guid': 'Invalid collection record ID format'
        })
    })
};
