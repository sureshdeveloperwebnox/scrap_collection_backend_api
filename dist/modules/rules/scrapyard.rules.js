"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapYardIdSchema = exports.scrapYardQuerySchema = exports.updateScrapYardSchema = exports.createScrapYardSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createScrapYardSchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required(),
    yardName: joi_1.default.string().min(2).max(100).required(),
    address: joi_1.default.string().required(),
    latitude: joi_1.default.number().min(-90).max(90).optional(),
    longitude: joi_1.default.number().min(-180).max(180).optional(),
    capacity: joi_1.default.number().integer().positive().required(),
    assignedEmployeeIds: joi_1.default.array().items(joi_1.default.string().uuid()).optional(),
    operatingHours: joi_1.default.object().optional()
});
exports.updateScrapYardSchema = joi_1.default.object({
    yardName: joi_1.default.string().min(2).max(100).optional(),
    address: joi_1.default.string().optional(),
    latitude: joi_1.default.number().min(-90).max(90).optional(),
    longitude: joi_1.default.number().min(-180).max(180).optional(),
    capacity: joi_1.default.number().integer().positive().optional(),
    assignedEmployeeIds: joi_1.default.array().items(joi_1.default.string().uuid()).optional(),
    operatingHours: joi_1.default.object().optional()
});
exports.scrapYardQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    organizationId: joi_1.default.number().integer().positive().optional()
});
exports.scrapYardIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required()
});
