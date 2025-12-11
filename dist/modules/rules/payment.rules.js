"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefundSchema = exports.paymentIdSchema = exports.paymentQuerySchema = exports.updatePaymentSchema = exports.createPaymentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const enum_1 = require("../model/enum");
exports.createPaymentSchema = joi_1.default.object({
    orderId: joi_1.default.string().uuid().required(),
    customerId: joi_1.default.string().uuid().required(),
    collectorId: joi_1.default.string().uuid().optional(),
    amount: joi_1.default.number().positive().required(),
    paymentType: joi_1.default.string().valid(...Object.values(enum_1.PaymentTypeEnum)).required(),
    receiptUrl: joi_1.default.string().uri().optional()
});
exports.updatePaymentSchema = joi_1.default.object({
    amount: joi_1.default.number().positive().optional(),
    paymentType: joi_1.default.string().valid(...Object.values(enum_1.PaymentTypeEnum)).optional(),
    receiptUrl: joi_1.default.string().uri().optional(),
    status: joi_1.default.string().valid(...Object.values(enum_1.PaymentStatusEnum)).optional()
});
exports.paymentQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    status: joi_1.default.string().valid(...Object.values(enum_1.PaymentStatusEnum)).optional(),
    paymentType: joi_1.default.string().valid(...Object.values(enum_1.PaymentTypeEnum)).optional(),
    customerId: joi_1.default.string().uuid().optional(),
    collectorId: joi_1.default.string().uuid().optional(),
    organizationId: joi_1.default.number().integer().positive().optional(),
    dateFrom: joi_1.default.string().isoDate().optional(),
    dateTo: joi_1.default.string().isoDate().optional()
});
exports.paymentIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required()
});
exports.createRefundSchema = joi_1.default.object({
    amount: joi_1.default.number().positive().required(),
    reason: joi_1.default.string().optional(),
    processedByAdmin: joi_1.default.string().required()
});
