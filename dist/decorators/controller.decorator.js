"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTROLLER_METADATA = void 0;
exports.Controller = Controller;
require("reflect-metadata");
exports.CONTROLLER_METADATA = 'controller:metadata';
function Controller(basePath) {
    return (target) => {
        Reflect.defineMetadata(exports.CONTROLLER_METADATA, basePath, target);
        // Make sure we return the class constructor
        return target;
    };
}
