// src/routes/api.routes.ts
import { Router } from 'express';
import 'reflect-metadata';
import { 
  CONTROLLER_METADATA, 
  METHOD_METADATA, 
  PATH_METADATA,
  MIDDLEWARE_METADATA
} from '../decorators';
import { VALIDATE_METADATA } from '../decorators/middleware.decorator';
import { AUTHENTICATE_METADATA } from '../decorators/authenticate.decorator';
import { createRoleMiddleware } from '../middlewares/auth.middleware';

export interface AttachControllersOptions {
  middleware: {
    auth: any;
    validator: any;
  };
}

export const attachControllers = (
  router: any,
  controllers: any[],
  options: AttachControllersOptions
) => {
  for (const controller of controllers) {
    const instance = new controller();
    const basePath = Reflect.getMetadata(CONTROLLER_METADATA, controller);
    const prototype = Object.getPrototypeOf(instance);
    const methodNames = Object.getOwnPropertyNames(prototype)
      .filter(prop => prop !== 'constructor' && typeof prototype[prop] === 'function');

    for (const methodName of methodNames) {
      const method = prototype[methodName];
      
      // Skip methods that don't have HTTP method metadata
      if (!Reflect.hasMetadata(METHOD_METADATA, method)) {
        continue;
      }
      
      // Get method metadata
      const httpMethod = Reflect.getMetadata(METHOD_METADATA, method);
      const path = Reflect.getMetadata(PATH_METADATA, method);
      const middlewares = Reflect.getMetadata(MIDDLEWARE_METADATA, method) || [];
      const validationRules = Reflect.getMetadata(VALIDATE_METADATA, method) || [];
      
      // Try to get auth categories with extra logging
      let authCategories = [];
      if (Reflect.hasMetadata(AUTHENTICATE_METADATA, method)) {
        authCategories = Reflect.getMetadata(AUTHENTICATE_METADATA, method);
        console.log(`Found auth categories for ${methodName}:`, authCategories);
      } else {
        console.log(`No auth categories found for ${methodName}`);
      }
      
      // Create full route path
      const fullPath = `${basePath}${path}`;
      
      // Set up the route handler
      const routeHandler = (req: any, res: any) => {
        Promise.resolve(method.call(instance, req))
          .then((result: any) => {
            if (result && typeof result.send === 'function') {
              result.send(res);
            } else {
              res.send(result);
            }
          })
          .catch((error: any) => {
            console.error('Route handler error:', error);
            res.status(500).json({
              success: false,
              message: 'Internal server error',
              error: error.message
            });
          });
      };
      
      // Build middleware stack
      const middlewareStack = [...middlewares];
      
      // Add auth middleware if authentication required
      if (authCategories && authCategories.length > 0) {
        middlewareStack.push(createRoleMiddleware(authCategories));
      }
      
      // Add validation middleware if validation rules provided
      if (validationRules && validationRules.length > 0) {
        middlewareStack.push((req: any, res: any, next: any) => {
          options.middleware.validator(req, res, next, validationRules);
        });
      }
      
      // Register the route
      router[httpMethod](fullPath, ...middlewareStack, routeHandler);
    
    }
  }
};