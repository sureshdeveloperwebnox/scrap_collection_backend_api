"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATE_METADATA = exports.MIDDLEWARE_METADATA = void 0;
exports.Middleware = Middleware;
exports.Validate = Validate;
require("reflect-metadata");
exports.MIDDLEWARE_METADATA = 'middleware:metadata';
exports.VALIDATE_METADATA = 'validate:metadata';
function Middleware(middleware) {
    return (target, key, descriptor) => {
        const middlewares = Reflect.getMetadata(exports.MIDDLEWARE_METADATA, descriptor.value) || [];
        Reflect.defineMetadata(exports.MIDDLEWARE_METADATA, [...middlewares, middleware], descriptor.value);
        return descriptor;
    };
}
function Validate(rules) {
    return (target, key, descriptor) => {
        Reflect.defineMetadata(exports.VALIDATE_METADATA, rules, descriptor.value);
        return descriptor;
    };
}
