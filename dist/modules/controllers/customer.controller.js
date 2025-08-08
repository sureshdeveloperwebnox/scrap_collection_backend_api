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
exports.CustomerController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const customer_1 = require("../services/customer");
const customer_rules_1 = require("../rules/customer.rules");
const api_result_1 = require("../../utils/api-result");
let CustomerController = class CustomerController {
    constructor() {
        this.customerService = new customer_1.CustomerService();
    }
    async createCustomer(req, res) {
        try {
            const result = await this.customerService.createCustomer(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createCustomer", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getCustomers(req, res) {
        try {
            const result = await this.customerService.getCustomers(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCustomers", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getCustomerById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.customerService.getCustomerById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCustomerById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getCustomerByUserId(req, res) {
        try {
            const { userId } = req.params;
            const result = await this.customerService.getCustomerByUserId(userId);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCustomerByUserId", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateCustomer(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.customerService.updateCustomer(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updateCustomer", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteCustomer(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.customerService.deleteCustomer(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deleteCustomer", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getCustomerStats(req, res) {
        try {
            const organizationId = parseInt(req.params.organizationId);
            const result = await this.customerService.getCustomerStats(organizationId);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCustomerStats", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getCustomerOrders(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.customerService.getCustomerOrders(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCustomerOrders", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getCustomerPayments(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.customerService.getCustomerPayments(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCustomerPayments", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getCustomerReviews(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.customerService.getCustomerReviews(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCustomerReviews", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([customer_rules_1.createCustomerSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createCustomer", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([customer_rules_1.customerQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomers", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([customer_rules_1.customerIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerById", null);
__decorate([
    (0, method_decorator_1.GET)('/user/:userId'),
    (0, middleware_decorator_1.Validate)([customer_rules_1.customerUserIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerByUserId", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([customer_rules_1.customerIdSchema, customer_rules_1.updateCustomerSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateCustomer", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([customer_rules_1.customerIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "deleteCustomer", null);
__decorate([
    (0, method_decorator_1.GET)('/stats/:organizationId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerStats", null);
__decorate([
    (0, method_decorator_1.GET)('/:id/orders'),
    (0, middleware_decorator_1.Validate)([customer_rules_1.customerIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerOrders", null);
__decorate([
    (0, method_decorator_1.GET)('/:id/payments'),
    (0, middleware_decorator_1.Validate)([customer_rules_1.customerIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerPayments", null);
__decorate([
    (0, method_decorator_1.GET)('/:id/reviews'),
    (0, middleware_decorator_1.Validate)([customer_rules_1.customerIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerReviews", null);
exports.CustomerController = CustomerController = __decorate([
    (0, controller_decorator_1.Controller)('/customers'),
    __metadata("design:paramtypes", [])
], CustomerController);
