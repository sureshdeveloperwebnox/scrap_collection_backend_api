import { Response, NextFunction } from 'express';
import { RequestX } from '../utils/request.interface';
import { ApiResult } from '../utils/api-result';
import { MobileAuth } from '../modules/services/mobile-auth';

/**
 * Mobile Authentication Middleware
 * - Verifies access token from Authorization header
 * - Checks if collector is active
 * - Attaches collector data to request object
 */
export const mobileAuthMiddleware = async (
    req: RequestX,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return ApiResult.error('No token provided. Authorization denied', 401).send(res);
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return ApiResult.error('No token provided. Authorization denied', 401).send(res);
        }

        // Verify token
        const mobileAuth = new MobileAuth();
        const decoded = mobileAuth.verifyAccessToken(token);

        if (!decoded) {
            return ApiResult.error('Invalid or expired token', 401).send(res);
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
    } catch (error: any) {
        console.error('Mobile auth middleware error:', error);
        return ApiResult.error('Authentication failed', 401).send(res);
    }
};
