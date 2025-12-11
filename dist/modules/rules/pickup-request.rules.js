"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPickupRequestSchema = exports.pickupRequestIdSchema = exports.pickupRequestQuerySchema = exports.updatePickupRequestSchema = exports.createPickupRequestSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const enum_1 = require("../model/enum");
exports.createPickupRequestSchema = joi_1.default.object({
    customerId: joi_1.default.string().uuid().required(),
    vehicleDetails: joi_1.default.object({
        make: joi_1.default.string().optional(),
        model: joi_1.default.string().optional(),
        year: joi_1.default.number().integer().optional(),
        condition: joi_1.default.string().optional(),
        type: joi_1.default.string().optional()
    }).required(),
    pickupAddress: joi_1.default.string().required(),
    latitude: joi_1.default.number().min(-90).max(90).optional(),
    longitude: joi_1.default.number().min(-180).max(180).optional(),
    organizationId: joi_1.default.number().integer().positive().required()
});
exports.updatePickupRequestSchema = joi_1.default.object({
    vehicleDetails: joi_1.default.object({
        make: joi_1.default.string().optional(),
        model: joi_1.default.string().optional(),
        year: joi_1.default.number().integer().optional(),
        condition: joi_1.default.string().optional(),
        type: joi_1.default.string().optional()
    }).optional(),
    pickupAddress: joi_1.default.string().optional(),
    latitude: joi_1.default.number().min(-90).max(90).optional(),
    longitude: joi_1.default.number().min(-180).max(180).optional(),
    status: joi_1.default.string().valid(...Object.values(enum_1.PickupRequestStatus)).optional(),
    assignedTo: joi_1.default.string().uuid().optional()
});
exports.pickupRequestQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    status: joi_1.default.string().valid(...Object.values(enum_1.PickupRequestStatus)).optional(),
    assignedTo: joi_1.default.string().uuid().optional(),
    customerId: joi_1.default.string().uuid().optional(),
    organizationId: joi_1.default.number().integer().positive().optional()
});
exports.pickupRequestIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required()
});
exports.assignPickupRequestSchema = joi_1.default.object({
    collectorId: joi_1.default.string().uuid().required()
});
