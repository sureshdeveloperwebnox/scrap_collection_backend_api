"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewIdSchema = exports.reviewQuerySchema = exports.updateReviewSchema = exports.createReviewSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createReviewSchema = joi_1.default.object({
    orderId: joi_1.default.string().uuid().required(),
    customerId: joi_1.default.string().uuid().required(),
    collectorId: joi_1.default.string().uuid().required(),
    rating: joi_1.default.number().integer().min(1).max(5).required(),
    comment: joi_1.default.string().optional(),
    organizationId: joi_1.default.number().integer().positive().required()
});
exports.updateReviewSchema = joi_1.default.object({
    rating: joi_1.default.number().integer().min(1).max(5).optional(),
    comment: joi_1.default.string().optional()
});
exports.reviewQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    collectorId: joi_1.default.string().uuid().optional(),
    customerId: joi_1.default.string().uuid().optional(),
    minRating: joi_1.default.number().integer().min(1).max(5).optional(),
    organizationId: joi_1.default.number().integer().positive().optional()
});
exports.reviewIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required()
});
