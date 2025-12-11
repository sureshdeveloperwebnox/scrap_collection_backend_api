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
exports.OrderController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const order_1 = require("../services/order");
const order_rules_1 = require("../rules/order.rules");
const api_result_1 = require("../../utils/api-result");
let OrderController = class OrderController {
    constructor() {
        this.orderService = new order_1.OrderService();
    }
    async createOrder(req, res) {
        try {
            const result = await this.orderService.createOrder(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createOrder", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getOrders(req, res) {
        try {
            const result = await this.orderService.getOrders(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getOrders", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getOrderById(req, res) {
        try {
            const id = req.params.id;
            const result = await this.orderService.getOrderById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getOrderById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateOrder(req, res) {
        try {
            const id = req.params.id;
            const result = await this.orderService.updateOrder(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updateOrder", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteOrder(req, res) {
        try {
            const id = req.params.id;
            const result = await this.orderService.deleteOrder(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deleteOrder", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async assignOrder(req, res) {
        try {
            const id = req.params.id;
            const result = await this.orderService.assignOrder(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in assignOrder", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getOrderTimeline(req, res) {
        try {
            const id = req.params.id;
            const result = await this.orderService.getOrderTimeline(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getOrderTimeline", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([order_rules_1.createOrderSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrder", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([order_rules_1.orderQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrders", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([order_rules_1.orderIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([order_rules_1.orderIdSchema, order_rules_1.updateOrderSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "updateOrder", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([order_rules_1.orderIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "deleteOrder", null);
__decorate([
    (0, method_decorator_1.POST)('/:id/assign'),
    (0, middleware_decorator_1.Validate)([order_rules_1.orderIdSchema, order_rules_1.assignOrderSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "assignOrder", null);
__decorate([
    (0, method_decorator_1.GET)('/:id/timeline'),
    (0, middleware_decorator_1.Validate)([order_rules_1.orderIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderTimeline", null);
exports.OrderController = OrderController = __decorate([
    (0, controller_decorator_1.Controller)('/orders'),
    __metadata("design:paramtypes", [])
], OrderController);
