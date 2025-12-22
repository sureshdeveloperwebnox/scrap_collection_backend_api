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
exports.EmployeeController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const employee_1 = require("../services/employee");
const employee_rules_1 = require("../rules/employee.rules");
const api_result_1 = require("../../utils/api-result");
let EmployeeController = class EmployeeController {
    constructor() {
        this.employeeService = new employee_1.EmployeeService();
    }
    async getEmployeeStats(req, res) {
        try {
            const organizationId = parseInt(req.params.organizationId);
            if (isNaN(organizationId)) {
                api_result_1.ApiResult.error("Invalid organization ID", 400).send(res);
                return;
            }
            const result = await this.employeeService.getEmployeeStats(organizationId);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getEmployeeStats", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async createEmployee(req, res) {
        try {
            const result = await this.employeeService.createEmployee(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createEmployee", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getEmployees(req, res) {
        try {
            const result = await this.employeeService.getEmployees(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getEmployees", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getEmployeeById(req, res) {
        try {
            const id = req.params.id;
            const result = await this.employeeService.getEmployeeById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getEmployeeById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateEmployee(req, res) {
        try {
            const id = req.params.id;
            const result = await this.employeeService.updateEmployee(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updateEmployee", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteEmployee(req, res) {
        try {
            const id = req.params.id;
            const result = await this.employeeService.deleteEmployee(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deleteEmployee", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async activateEmployee(req, res) {
        try {
            const id = req.params.id;
            const result = await this.employeeService.activateEmployee(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in activateEmployee", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deactivateEmployee(req, res) {
        try {
            const id = req.params.id;
            const result = await this.employeeService.deactivateEmployee(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deactivateEmployee", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getEmployeePerformance(req, res) {
        try {
            const id = req.params.id;
            const result = await this.employeeService.getEmployeePerformance(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getEmployeePerformance", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.EmployeeController = EmployeeController;
__decorate([
    (0, method_decorator_1.GET)('/stats/:organizationId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeStats", null);
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([employee_rules_1.createEmployeeSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "createEmployee", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([employee_rules_1.employeeQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployees", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([employee_rules_1.employeeIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeeById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([employee_rules_1.employeeIdSchema, employee_rules_1.updateEmployeeSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "updateEmployee", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([employee_rules_1.employeeIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "deleteEmployee", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id/activate'),
    (0, middleware_decorator_1.Validate)([employee_rules_1.employeeIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "activateEmployee", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id/deactivate'),
    (0, middleware_decorator_1.Validate)([employee_rules_1.employeeIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "deactivateEmployee", null);
__decorate([
    (0, method_decorator_1.GET)('/:id/performance'),
    (0, middleware_decorator_1.Validate)([employee_rules_1.employeeIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getEmployeePerformance", null);
exports.EmployeeController = EmployeeController = __decorate([
    (0, controller_decorator_1.Controller)('/employees'),
    __metadata("design:paramtypes", [])
], EmployeeController);
