"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileUpdateWorkOrderStatusSchema = exports.mobileWorkOrderIdSchema = exports.mobileWorkOrderQuerySchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Validation schema for work order query parameters
 */
exports.mobileWorkOrderQuerySchema = {
    query: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).optional(),
        limit: joi_1.default.number().integer().min(1).max(100).optional(),
        status: joi_1.default.string().optional(), // Can be comma-separated
        paymentStatus: joi_1.default.string().optional(),
        dateFrom: joi_1.default.date().iso().optional(),
        dateTo: joi_1.default.date().iso().optional(),
        pickupDateFrom: joi_1.default.date().iso().optional(),
        pickupDateTo: joi_1.default.date().iso().optional(),
        yardId: joi_1.default.string().uuid().optional(),
        nearLatitude: joi_1.default.number().min(-90).max(90).optional(),
        nearLongitude: joi_1.default.number().min(-180).max(180).optional(),
        radiusKm: joi_1.default.number().min(1).max(1000).optional(),
        search: joi_1.default.string().max(200).optional(),
        sortBy: joi_1.default.string().valid('createdAt', 'pickupTime', 'quotedPrice', 'customerName', 'orderStatus').optional(),
        sortOrder: joi_1.default.string().valid('asc', 'desc').optional(),
        hasPhotos: joi_1.default.boolean().optional(),
        priceMin: joi_1.default.number().min(0).optional(),
        priceMax: joi_1.default.number().min(0).optional(),
        collectorLat: joi_1.default.number().min(-90).max(90).optional(),
        collectorLon: joi_1.default.number().min(-180).max(180).optional()
    })
};
/**
 * Validation schema for order ID parameter
 */
exports.mobileWorkOrderIdSchema = {
    params: joi_1.default.object({
        id: joi_1.default.string().required().messages({
            'any.required': 'Order ID or Number is required'
        })
    })
};
/**
 * Validation schema for updating work order status
 */
exports.mobileUpdateWorkOrderStatusSchema = {
    body: joi_1.default.object({
        status: joi_1.default.string()
            .valid('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
            .required()
            .messages({
            'any.only': 'Invalid order status',
            'any.required': 'Status is required'
        }),
        timestamp: joi_1.default.date().iso().optional(),
        photos: joi_1.default.array().items(joi_1.default.string()).when('status', {
            is: 'COMPLETED',
            then: joi_1.default.array().min(1).required().messages({
                'any.required': 'Photos are required when marking as COMPLETED',
                'array.min': 'At least one photo is required'
            }),
            otherwise: joi_1.default.forbidden().messages({
                'any.unknown': 'Photos can only be provided when status is COMPLETED'
            })
        })
    }).unknown(false)
};
