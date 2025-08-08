"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloQueryValidation = void 0;
// src/rules/hello.rules.ts
const joi_1 = __importDefault(require("joi"));
exports.helloQueryValidation = {
    query: joi_1.default.object({
        name: joi_1.default.string().min(2).max(50).optional().messages({
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 50 characters'
        })
    })
};
