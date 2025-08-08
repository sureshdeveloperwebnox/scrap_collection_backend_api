"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATCH = exports.DELETE = exports.PUT = exports.POST = exports.GET = exports.RequestMethod = exports.PATH_METADATA = exports.METHOD_METADATA = void 0;
require("reflect-metadata");
exports.METHOD_METADATA = 'method:metadata';
exports.PATH_METADATA = 'path:metadata';
var RequestMethod;
(function (RequestMethod) {
    RequestMethod["GET"] = "get";
    RequestMethod["POST"] = "post";
    RequestMethod["PUT"] = "put";
    RequestMethod["DELETE"] = "delete";
    RequestMethod["PATCH"] = "patch";
})(RequestMethod || (exports.RequestMethod = RequestMethod = {}));
const createMappingDecorator = (method) => {
    return (path) => {
        return (target, key, descriptor) => {
            Reflect.defineMetadata(exports.PATH_METADATA, path, descriptor.value);
            Reflect.defineMetadata(exports.METHOD_METADATA, method, descriptor.value);
            return descriptor;
        };
    };
};
exports.GET = createMappingDecorator(RequestMethod.GET);
exports.POST = createMappingDecorator(RequestMethod.POST);
exports.PUT = createMappingDecorator(RequestMethod.PUT);
exports.DELETE = createMappingDecorator(RequestMethod.DELETE);
exports.PATCH = createMappingDecorator(RequestMethod.PATCH);
