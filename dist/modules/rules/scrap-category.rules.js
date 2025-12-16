"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapCategoryIdSchema = exports.scrapCategoryQuerySchema = exports.updateScrapCategorySchema = exports.createScrapCategorySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createScrapCategorySchema = joi_1.default.object({
    organizationId: joi_1.default.number().integer().positive().required(),
    name: joi_1.default.string().min(2).max(100).required(),
    description: joi_1.default.string().max(500).optional(),
});
exports.updateScrapCategorySchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).optional(),
    description: joi_1.default.string().max(500).optional(),
});
exports.scrapCategoryQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    organizationId: joi_1.default.number().integer().positive().optional(),
});
exports.scrapCategoryIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required(),
});
