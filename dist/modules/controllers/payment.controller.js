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
exports.PaymentController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const payment_1 = require("../services/payment");
const payment_rules_1 = require("../rules/payment.rules");
const api_result_1 = require("../../utils/api-result");
let PaymentController = class PaymentController {
    constructor() {
        this.paymentService = new payment_1.PaymentService();
    }
    async createPayment(req, res) {
        try {
            const result = await this.paymentService.createPayment(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createPayment", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getPayments(req, res) {
        try {
            const result = await this.paymentService.getPayments(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getPayments", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getPaymentById(req, res) {
        try {
            const id = req.params.id;
            const result = await this.paymentService.getPaymentById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getPaymentById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updatePayment(req, res) {
        try {
            const id = req.params.id;
            const result = await this.paymentService.updatePayment(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updatePayment", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async createRefund(req, res) {
        try {
            const id = req.params.id;
            const result = await this.paymentService.createRefund(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createRefund", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([payment_rules_1.createPaymentSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createPayment", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([payment_rules_1.paymentQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPayments", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([payment_rules_1.paymentIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPaymentById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([payment_rules_1.paymentIdSchema, payment_rules_1.updatePaymentSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "updatePayment", null);
__decorate([
    (0, method_decorator_1.POST)('/:id/refund'),
    (0, middleware_decorator_1.Validate)([payment_rules_1.paymentIdSchema, payment_rules_1.createRefundSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createRefund", null);
exports.PaymentController = PaymentController = __decorate([
    (0, controller_decorator_1.Controller)('/payments'),
    __metadata("design:paramtypes", [])
], PaymentController);
