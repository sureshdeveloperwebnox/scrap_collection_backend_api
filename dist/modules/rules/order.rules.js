"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignOrderSchema = exports.orderIdSchema = exports.orderQuerySchema = exports.updateOrderSchema = exports.createOrderSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const enum_1 = require("../model/enum");
const phone_validator_1 = require("../../utils/phone-validator");
exports.createOrderSchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required(),
    leadId: joi_1.default.string().uuid().optional(),
    customerName: joi_1.default.string().min(2).max(100).required(),
    customerPhone: joi_1.default.string().custom(phone_validator_1.phoneCustomValidation, 'phone validation').required().messages({
        'any.required': 'Phone number is required',
        'any.custom': '{{#error.message}}'
    }),
    address: joi_1.default.string().required(),
    latitude: joi_1.default.number().min(-90).max(90).optional(),
    longitude: joi_1.default.number().min(-180).max(180).optional(),
    vehicleDetails: joi_1.default.object({
        make: joi_1.default.string().optional(),
        model: joi_1.default.string().optional(),
        year: joi_1.default.number().integer().optional(),
        condition: joi_1.default.string().optional()
    }).required(),
    assignedCollectorId: joi_1.default.string().uuid().optional(),
    pickupTime: joi_1.default.date().optional(),
    quotedPrice: joi_1.default.number().positive().optional(),
    yardId: joi_1.default.string().uuid().optional(),
    customerNotes: joi_1.default.string().optional(),
    adminNotes: joi_1.default.string().optional(),
    customerId: joi_1.default.string().uuid().optional()
});
exports.updateOrderSchema = joi_1.default.object({
    customerName: joi_1.default.string().min(2).max(100).optional(),
    customerPhone: joi_1.default.string().custom(phone_validator_1.phoneCustomValidation, 'phone validation').optional().messages({
        'any.custom': '{{#error.message}}'
    }),
    address: joi_1.default.string().optional(),
    latitude: joi_1.default.number().min(-90).max(90).optional(),
    longitude: joi_1.default.number().min(-180).max(180).optional(),
    vehicleDetails: joi_1.default.object({
        make: joi_1.default.string().optional(),
        model: joi_1.default.string().optional(),
        year: joi_1.default.number().integer().optional(),
        condition: joi_1.default.string().optional()
    }).optional(),
    assignedCollectorId: joi_1.default.string().uuid().optional(),
    pickupTime: joi_1.default.date().optional(),
    orderStatus: joi_1.default.string().valid(...Object.values(enum_1.OrderStatus)).optional(),
    paymentStatus: joi_1.default.string().valid(...Object.values(enum_1.PaymentStatusEnum)).optional(),
    quotedPrice: joi_1.default.number().positive().optional(),
    actualPrice: joi_1.default.number().positive().optional(),
    yardId: joi_1.default.string().uuid().optional(),
    customerNotes: joi_1.default.string().optional(),
    adminNotes: joi_1.default.string().optional()
});
exports.orderQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    status: joi_1.default.string().valid(...Object.values(enum_1.OrderStatus)).optional(),
    paymentStatus: joi_1.default.string().valid(...Object.values(enum_1.PaymentStatusEnum)).optional(),
    collectorId: joi_1.default.string().uuid().optional(),
    organizationId: joi_1.default.number().integer().positive().optional(),
    dateFrom: joi_1.default.string().isoDate().optional(),
    dateTo: joi_1.default.string().isoDate().optional(),
    location: joi_1.default.string().optional()
});
exports.orderIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required()
});
exports.assignOrderSchema = joi_1.default.object({
    collectorId: joi_1.default.string().uuid().required()
});
