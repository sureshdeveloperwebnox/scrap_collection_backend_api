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
      const routeHandler = async (req: any, res: any, next: any) => {
        try {
          const result = await Promise.resolve(method.call(instance, req, res, next));

          // If the controller already sent a response, do nothing
          if (res.headersSent || res.writableEnded) {
            return;
          }

          // If the controller returned a custom responder object with a send method
          if (result && typeof (result as any).send === 'function') {
            (result as any).send(res);
            return;
          }

          // If the controller returned a value, send it; otherwise end with 204
          if (typeof result !== 'undefined') {
            res.send(result);
          } else {
            res.status(204).end();
          }
        } catch (error: any) {
          console.error('Route handler error:', error);
          if (!res.headersSent && !res.writableEnded) {
            res.status(500).json({
              success: false,
              message: 'Internal server error',
              error: error?.message ?? 'Unknown error'
            });
          } else {
            // If headers already sent, delegate to default error handler
            next(error);
          }
        }
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