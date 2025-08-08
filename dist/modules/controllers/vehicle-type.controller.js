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
exports.VehicleTypeController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const vehicle_type_1 = require("../services/vehicle-type");
const vehicle_type_rules_1 = require("../rules/vehicle-type.rules");
const api_result_1 = require("../../utils/api-result");
let VehicleTypeController = class VehicleTypeController {
    constructor() {
        this.vehicleTypeService = new vehicle_type_1.VehicleTypeService();
    }
    async createVehicleType(req, res) {
        try {
            const result = await this.vehicleTypeService.createVehicleType(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createVehicleType", error);
            api_result_1.ApiResult.error("Error in createVehicleType", 500).send(res);
        }
    }
    async getVehicleTypes(req, res) {
        try {
            const result = await this.vehicleTypeService.getVehicleTypes(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getVehicleTypes", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getVehicleTypeById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.vehicleTypeService.getVehicleTypeById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getVehicleTypeById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateVehicleType(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.vehicleTypeService.updateVehicleType(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updateVehicleType", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteVehicleType(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.vehicleTypeService.deleteVehicleType(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deleteVehicleType", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getVehicleTypeStats(req, res) {
        try {
            const organizationId = parseInt(req.params.organizationId);
            const result = await this.vehicleTypeService.getVehicleTypeStats(organizationId);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getVehicleTypeStats", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.VehicleTypeController = VehicleTypeController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([vehicle_type_rules_1.createVehicleTypeSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehicleTypeController.prototype, "createVehicleType", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([vehicle_type_rules_1.vehicleTypeQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehicleTypeController.prototype, "getVehicleTypes", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([vehicle_type_rules_1.vehicleTypeIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehicleTypeController.prototype, "getVehicleTypeById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([vehicle_type_rules_1.vehicleTypeIdSchema, vehicle_type_rules_1.updateVehicleTypeSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehicleTypeController.prototype, "updateVehicleType", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([vehicle_type_rules_1.vehicleTypeIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehicleTypeController.prototype, "deleteVehicleType", null);
__decorate([
    (0, method_decorator_1.GET)('/stats/:organizationId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehicleTypeController.prototype, "getVehicleTypeStats", null);
exports.VehicleTypeController = VehicleTypeController = __decorate([
    (0, controller_decorator_1.Controller)('/vehicle-types'),
    __metadata("design:paramtypes", [])
], VehicleTypeController);
