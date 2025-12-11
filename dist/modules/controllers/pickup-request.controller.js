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
exports.PickupRequestController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const pickup_request_1 = require("../services/pickup-request");
const pickup_request_rules_1 = require("../rules/pickup-request.rules");
const api_result_1 = require("../../utils/api-result");
let PickupRequestController = class PickupRequestController {
    constructor() {
        this.pickupRequestService = new pickup_request_1.PickupRequestService();
    }
    async createPickupRequest(req, res) {
        try {
            const result = await this.pickupRequestService.createPickupRequest(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createPickupRequest", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getPickupRequests(req, res) {
        try {
            const result = await this.pickupRequestService.getPickupRequests(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getPickupRequests", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getPickupRequestById(req, res) {
        try {
            const id = req.params.id;
            const result = await this.pickupRequestService.getPickupRequestById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getPickupRequestById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updatePickupRequest(req, res) {
        try {
            const id = req.params.id;
            const result = await this.pickupRequestService.updatePickupRequest(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updatePickupRequest", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deletePickupRequest(req, res) {
        try {
            const id = req.params.id;
            const result = await this.pickupRequestService.deletePickupRequest(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deletePickupRequest", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async assignPickupRequest(req, res) {
        try {
            const id = req.params.id;
            const result = await this.pickupRequestService.assignPickupRequest(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in assignPickupRequest", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.PickupRequestController = PickupRequestController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([pickup_request_rules_1.createPickupRequestSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PickupRequestController.prototype, "createPickupRequest", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([pickup_request_rules_1.pickupRequestQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PickupRequestController.prototype, "getPickupRequests", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([pickup_request_rules_1.pickupRequestIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PickupRequestController.prototype, "getPickupRequestById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([pickup_request_rules_1.pickupRequestIdSchema, pickup_request_rules_1.updatePickupRequestSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PickupRequestController.prototype, "updatePickupRequest", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([pickup_request_rules_1.pickupRequestIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PickupRequestController.prototype, "deletePickupRequest", null);
__decorate([
    (0, method_decorator_1.POST)('/:id/assign'),
    (0, middleware_decorator_1.Validate)([pickup_request_rules_1.pickupRequestIdSchema, pickup_request_rules_1.assignPickupRequestSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PickupRequestController.prototype, "assignPickupRequest", null);
exports.PickupRequestController = PickupRequestController = __decorate([
    (0, controller_decorator_1.Controller)('/pickup-requests'),
    __metadata("design:paramtypes", [])
], PickupRequestController);
