"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE_METADATA = void 0;
exports.Authenticate = Authenticate;
// src/decorators/authenticate.decorator.ts
require("reflect-metadata");
exports.AUTHENTICATE_METADATA = 'authenticate:metadata';
function Authenticate(allowedCategories) {
    return (target, key, descriptor) => {
        console.log(`Setting auth metadata for ${String(key)} with categories:`, allowedCategories);
        Reflect.defineMetadata(exports.AUTHENTICATE_METADATA, allowedCategories, descriptor.value);
        return descriptor;
    };
}
