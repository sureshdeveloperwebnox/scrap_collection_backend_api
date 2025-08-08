"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachControllers = void 0;
require("reflect-metadata");
const decorators_1 = require("../decorators");
const middleware_decorator_1 = require("../decorators/middleware.decorator");
const authenticate_decorator_1 = require("../decorators/authenticate.decorator");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const attachControllers = (router, controllers, options) => {
    for (const controller of controllers) {
        const instance = new controller();
        const basePath = Reflect.getMetadata(decorators_1.CONTROLLER_METADATA, controller);
        const prototype = Object.getPrototypeOf(instance);
        const methodNames = Object.getOwnPropertyNames(prototype)
            .filter(prop => prop !== 'constructor' && typeof prototype[prop] === 'function');
        for (const methodName of methodNames) {
            const method = prototype[methodName];
            // Skip methods that don't have HTTP method metadata
            if (!Reflect.hasMetadata(decorators_1.METHOD_METADATA, method)) {
                continue;
            }
            // Get method metadata
            const httpMethod = Reflect.getMetadata(decorators_1.METHOD_METADATA, method);
            const path = Reflect.getMetadata(decorators_1.PATH_METADATA, method);
            const middlewares = Reflect.getMetadata(decorators_1.MIDDLEWARE_METADATA, method) || [];
            const validationRules = Reflect.getMetadata(middleware_decorator_1.VALIDATE_METADATA, method) || [];
            // Try to get auth categories with extra logging
            let authCategories = [];
            if (Reflect.hasMetadata(authenticate_decorator_1.AUTHENTICATE_METADATA, method)) {
                authCategories = Reflect.getMetadata(authenticate_decorator_1.AUTHENTICATE_METADATA, method);
                console.log(`Found auth categories for ${methodName}:`, authCategories);
            }
            else {
                console.log(`No auth categories found for ${methodName}`);
            }
            // Create full route path
            const fullPath = `${basePath}${path}`;
            // Set up the route handler
            const routeHandler = async (req, res, next) => {
                var _a;
                try {
                    const result = await Promise.resolve(method.call(instance, req, res, next));
                    // If the controller already sent a response, do nothing
                    if (res.headersSent || res.writableEnded) {
                        return;
                    }
                    // If the controller returned a custom responder object with a send method
                    if (result && typeof result.send === 'function') {
                        result.send(res);
                        return;
                    }
                    // If the controller returned a value, send it; otherwise end with 204
                    if (typeof result !== 'undefined') {
                        res.send(result);
                    }
                    else {
                        res.status(204).end();
                    }
                }
                catch (error) {
                    console.error('Route handler error:', error);
                    if (!res.headersSent && !res.writableEnded) {
                        res.status(500).json({
                            success: false,
                            message: 'Internal server error',
                            error: (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown error'
                        });
                    }
                    else {
                        // If headers already sent, delegate to default error handler
                        next(error);
                    }
                }
            };
            // Build middleware stack
            const middlewareStack = [...middlewares];
            // Add auth middleware if authentication required
            if (authCategories && authCategories.length > 0) {
                middlewareStack.push((0, auth_middleware_1.createRoleMiddleware)(authCategories));
            }
            // Add validation middleware if validation rules provided
            if (validationRules && validationRules.length > 0) {
                middlewareStack.push((req, res, next) => {
                    options.middleware.validator(req, res, next, validationRules);
                });
            }
            // Register the route
            router[httpMethod](fullPath, ...middlewareStack, routeHandler);
        }
    }
};
exports.attachControllers = attachControllers;
