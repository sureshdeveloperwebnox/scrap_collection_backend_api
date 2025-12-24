"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileAuthMiddleware = void 0;
const api_result_1 = require("../utils/api-result");
const mobile_auth_1 = require("../modules/services/mobile-auth");
/**
 * Mobile Authentication Middleware
 * - Verifies access token from Authorization header
 * - Checks if collector is active
 * - Attaches collector data to request object
 */
const mobileAuthMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return api_result_1.ApiResult.error('No token provided. Authorization denied', 401).send(res);
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return api_result_1.ApiResult.error('No token provided. Authorization denied', 401).send(res);
        }
        // Verify token
        const mobileAuth = new mobile_auth_1.MobileAuth();
        const decoded = mobileAuth.verifyAccessToken(token);
        if (!decoded) {
            return api_result_1.ApiResult.error('Invalid or expired token', 401).send(res);
        }
        // Attach collector data to request
        req.collector = {
            id: decoded.id,
            email: decoded.email,
            phone: decoded.phone,
            fullName: decoded.fullName,
            role: decoded.role,
            roleId: decoded.roleId,
            organizationId: decoded.organizationId,
            scrapYardId: decoded.scrapYardId,
            crewId: decoded.crewId
        };
        next();
    }
    catch (error) {
        console.error('Mobile auth middleware error:', error);
        return api_result_1.ApiResult.error('Authentication failed', 401).send(res);
    }
};
exports.mobileAuthMiddleware = mobileAuthMiddleware;
