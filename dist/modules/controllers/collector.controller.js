"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectorController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const authenticate_decorator_1 = require("../../decorators/authenticate.decorator");
const user_category_enum_1 = require("../../utils/user-category.enum");
const employee_1 = require("../services/employee");
const employee_rules_1 = require("../rules/employee.rules");
const api_result_1 = require("../../utils/api-result");
let CollectorController = class CollectorController {
    constructor() {
        this.employeeService = new employee_1.EmployeeService();
    }
    async getCollectorStats(req, res) {
        var _a;
        try {
            // SECURITY: Extract organizationId from authenticated user
            const userOrganizationId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId)
                ? parseInt(req.user.organizationId)
                : undefined;
            if (!userOrganizationId) {
                api_result_1.ApiResult.error("Organization ID not found", 400).send(res);
                return;
            }
            // Get employee stats filtered by collector role
            const result = await this.employeeService.getEmployeeStats(userOrganizationId);
            // Rename the response for collectors context
            if (result && typeof result.send === 'function') {
                result.send(res);
            }
            else {
                api_result_1.ApiResult.success(result, 'Collector statistics retrieved successfully').send(res);
            }
        }
        catch (error) {
            console.log("Error in getCollectorStats", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getCollectors(req, res) {
        var _a;
        try {
            // SECURITY: Extract organizationId from authenticated user
            const userOrganizationId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId)
                ? parseInt(req.user.organizationId)
                : undefined;
            const queryWithOrgId = {
                ...req.query,
                organizationId: userOrganizationId
            };
            const result = await this.employeeService.getEmployees(queryWithOrgId);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCollectors", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getCollectorById(req, res) {
        try {
            const id = req.params.id;
            const result = await this.employeeService.getEmployeeById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCollectorById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getCollectorPerformance(req, res) {
        try {
            const id = req.params.id;
            const result = await this.employeeService.getEmployeePerformance(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCollectorPerformance", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.CollectorController = CollectorController;
__decorate([
    (0, method_decorator_1.GET)('/stats'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectorController.prototype, "getCollectorStats", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    (0, middleware_decorator_1.Validate)([employee_rules_1.employeeQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectorController.prototype, "getCollectors", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectorController.prototype, "getCollectorById", null);
__decorate([
    (0, method_decorator_1.GET)('/:id/performance'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectorController.prototype, "getCollectorPerformance", null);
exports.CollectorController = CollectorController = __decorate([
    (0, controller_decorator_1.Controller)('/collectors'),
    __metadata("design:paramtypes", [])
], CollectorController);
