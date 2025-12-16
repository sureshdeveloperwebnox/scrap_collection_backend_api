"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapNameIdSchema = exports.scrapNameQuerySchema = exports.updateScrapNameSchema = exports.createScrapNameSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createScrapNameSchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required(),
    name: joi_1.default.string().min(2).max(100).required(),
    scrapCategoryId: joi_1.default.string().uuid().required(),
    isActive: joi_1.default.boolean().default(true),
});
exports.updateScrapNameSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).optional(),
    scrapCategoryId: joi_1.default.string().uuid().optional(),
    isActive: joi_1.default.boolean().optional(),
});
exports.scrapNameQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    scrapCategoryId: joi_1.default.string().uuid().optional(),
    organizationId: joi_1.default.number().integer().positive().optional(),
    isActive: joi_1.default.boolean().optional(),
});
exports.scrapNameIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required(),
});
