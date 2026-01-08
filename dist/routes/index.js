"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineRouters = void 0;
const express_1 = require("express");
const api_routes_1 = require("./api.routes");
const controllers_1 = require("../modules/controllers");
const middlewares_1 = require("../middlewares");
const assignment_routes_1 = __importDefault(require("../modules/routes/assignment.routes"));
const combineRouters = (app) => {
    const apiRouter = (0, express_1.Router)();
    (0, api_routes_1.attachControllers)(apiRouter, [
        controllers_1.AuthController,
        controllers_1.HelloController,
        controllers_1.CustomerController,
        controllers_1.CountryController,
        controllers_1.LeadController,
        controllers_1.VehicleTypeController,
        controllers_1.VehicleNameController,
        controllers_1.CollectorController,
        controllers_1.CollectorAssignmentController,
        controllers_1.EmployeeController,
        controllers_1.OrderController,
        controllers_1.PickupRequestController,
        controllers_1.PaymentController,
        controllers_1.ReviewController,
        controllers_1.ScrapYardController,
        controllers_1.ScrapCategoryController,
        controllers_1.ScrapNameController,
        controllers_1.UploadController,
        controllers_1.CityController,
        controllers_1.RoleController,
        controllers_1.CrewController,
        controllers_1.MobileAuthController,
        controllers_1.MobileWorkOrderController,
        controllers_1.MobileScrapCollectionController,
        controllers_1.ScrapCollectionRecordController,
        controllers_1.OrganizationController
    ], {
        middleware: {
            auth: middlewares_1.createRoleMiddleware,
            validator: middlewares_1.ValidatorMiddleware,
        },
    });
    // Register assignment routes
    apiRouter.use('/assignments', assignment_routes_1.default);
    app.use('/api/v1', apiRouter);
};
exports.combineRouters = combineRouters;
