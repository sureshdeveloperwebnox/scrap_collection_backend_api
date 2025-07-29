// src/middlewares/role-auth.middleware.ts
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequestX } from '../utils/request.interface';
import { ApiResult } from '../utils/api-result';
import { UserCategory } from '../utils/user-category.enum';

export const createRoleMiddleware = (allowedCategories: UserCategory[]) => {
  return (req: RequestX, res: Response, next: NextFunction) => {
    
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return ApiResult.error('No token provided, authorization denied', 401).send(res);
    }

    try {
      // Verify token
      const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
      const decoded = jwt.verify(token, JWT_SECRET) as { 
        id: number, 
        email: string, 
        name: string, 
        category: UserCategory 
      };
      
      // Check if user category is allowed
      const hasAccess = allowedCategories.includes(UserCategory.ALL) || 
                        allowedCategories.includes(decoded.category);
                        
      
      if (!hasAccess) {
        return ApiResult.error('Insufficient permissions to access this resource', 403).send(res);
      }
      
      // Add user from payload
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      return ApiResult.error('Token is not valid', 401).send(res);
    }
  };
};