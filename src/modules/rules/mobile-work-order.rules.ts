import Joi from 'joi';

/**
 * Validation schema for work order query parameters
 */
export const mobileWorkOrderQuerySchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        status: Joi.string().optional(), // Can be comma-separated
        paymentStatus: Joi.string().optional(),
        dateFrom: Joi.date().iso().optional(),
        dateTo: Joi.date().iso().optional(),
        pickupDateFrom: Joi.date().iso().optional(),
        pickupDateTo: Joi.date().iso().optional(),
        yardId: Joi.string().uuid().optional(),
        nearLatitude: Joi.number().min(-90).max(90).optional(),
        nearLongitude: Joi.number().min(-180).max(180).optional(),
        radiusKm: Joi.number().min(1).max(1000).optional(),
        search: Joi.string().max(200).optional(),
        sortBy: Joi.string().valid('createdAt', 'pickupTime', 'quotedPrice', 'customerName', 'orderStatus').optional(),
        sortOrder: Joi.string().valid('asc', 'desc').optional(),
        hasPhotos: Joi.boolean().optional(),
        priceMin: Joi.number().min(0).optional(),
        priceMax: Joi.number().min(0).optional(),
        collectorLat: Joi.number().min(-90).max(90).optional(),
        collectorLon: Joi.number().min(-180).max(180).optional()
    })
};

/**
 * Validation schema for order ID parameter
 */
export const mobileWorkOrderIdSchema = {
    params: Joi.object({
        id: Joi.string().required().messages({
            'any.required': 'Order ID or Number is required'
        })
    })
};

/**
 * Validation schema for updating work order status
 */
export const mobileUpdateWorkOrderStatusSchema = {
    body: Joi.object({
        status: Joi.string()
            .valid('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
            .required()
            .messages({
                'any.only': 'Invalid order status',
                'any.required': 'Status is required'
            }),
        timestamp: Joi.date().iso().optional(),
        photos: Joi.array().items(Joi.string()).when('status', {
            is: 'COMPLETED',
            then: Joi.array().min(1).required().messages({
                'any.required': 'Photos are required when marking as COMPLETED',
                'array.min': 'At least one photo is required'
            }),
            otherwise: Joi.forbidden().messages({
                'any.unknown': 'Photos can only be provided when status is COMPLETED'
            })
        })
    }).unknown(false)
};
