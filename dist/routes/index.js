"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineRouters = void 0;
const express_1 = require("express");
const api_routes_1 = require("./api.routes");
const controllers_1 = require("../modules/controllers");
const middlewares_1 = require("../middlewares");
const combineRouters = (app) => {
    const apiRouter = (0, express_1.Router)();
    (0, api_routes_1.attachControllers)(apiRouter, [
        controllers_1.AuthController,
        controllers_1.HelloController,
        controllers_1.CountryController,
        controllers_1.LeadController,
        controllers_1.VehicleTypeController
    ], {
        middleware: {
            auth: middlewares_1.createRoleMiddleware,
            validator: middlewares_1.ValidatorMiddleware,
        },
    });
    app.use('/api/v1', apiRouter);
};
exports.combineRouters = combineRouters;
