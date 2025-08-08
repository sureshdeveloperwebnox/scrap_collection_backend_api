"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoleMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const api_result_1 = require("../utils/api-result");
const user_category_enum_1 = require("../utils/user-category.enum");
const createRoleMiddleware = (allowedCategories) => {
    return (req, res, next) => {
        // Get token from header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return api_result_1.ApiResult.error('No token provided, authorization denied', 401).send(res);
        }
        try {
            // Verify token
            const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Check if user category is allowed
            const hasAccess = allowedCategories.includes(user_category_enum_1.UserCategory.ALL) ||
                allowedCategories.includes(decoded.category);
            if (!hasAccess) {
                return api_result_1.ApiResult.error('Insufficient permissions to access this resource', 403).send(res);
            }
            // Add user from payload
            req.user = decoded;
            next();
        }
        catch (error) {
            console.error('Auth error:', error);
            return api_result_1.ApiResult.error('Token is not valid', 401).send(res);
        }
    };
};
exports.createRoleMiddleware = createRoleMiddleware;
