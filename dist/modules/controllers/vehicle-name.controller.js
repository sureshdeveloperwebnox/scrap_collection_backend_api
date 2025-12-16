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
exports.VehicleNameController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const vehicle_name_1 = require("../services/vehicle-name");
const vehicle_name_rules_1 = require("../rules/vehicle-name.rules");
const api_result_1 = require("../../utils/api-result");
let VehicleNameController = class VehicleNameController {
    constructor() {
        this.vehicleNameService = new vehicle_name_1.VehicleNameService();
    }
    async createVehicleName(req, res) {
        try {
            const result = await this.vehicleNameService.createVehicleName(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createVehicleName", error);
            api_result_1.ApiResult.error("Error in createVehicleName", 500).send(res);
        }
    }
    async getVehicleNames(req, res) {
        try {
            const result = await this.vehicleNameService.getVehicleNames(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getVehicleNames", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getVehicleNameById(req, res) {
        try {
            const id = req.params.id;
            const result = await this.vehicleNameService.getVehicleNameById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getVehicleNameById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateVehicleName(req, res) {
        try {
            const id = req.params.id;
            const result = await this.vehicleNameService.updateVehicleName(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updateVehicleName", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteVehicleName(req, res) {
        try {
            const id = req.params.id;
            const result = await this.vehicleNameService.deleteVehicleName(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deleteVehicleName", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getVehicleNameStats(req, res) {
        try {
            const organizationId = parseInt(req.params.organizationId);
            if (isNaN(organizationId)) {
                api_result_1.ApiResult.error("Invalid organization ID", 400).send(res);
                return;
            }
            const result = await this.vehicleNameService.getVehicleNameStats(organizationId);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getVehicleNameStats", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.VehicleNameController = VehicleNameController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([vehicle_name_rules_1.createVehicleNameSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehicleNameController.prototype, "createVehicleName", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([vehicle_name_rules_1.vehicleNameQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehicleNameController.prototype, "getVehicleNames", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([vehicle_name_rules_1.vehicleNameIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehicleNameController.prototype, "getVehicleNameById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([vehicle_name_rules_1.vehicleNameIdSchema, vehicle_name_rules_1.updateVehicleNameSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehicleNameController.prototype, "updateVehicleName", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([vehicle_name_rules_1.vehicleNameIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehicleNameController.prototype, "deleteVehicleName", null);
__decorate([
    (0, method_decorator_1.GET)('/stats/:organizationId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehicleNameController.prototype, "getVehicleNameStats", null);
exports.VehicleNameController = VehicleNameController = __decorate([
    (0, controller_decorator_1.Controller)('/vehicle-names'),
    __metadata("design:paramtypes", [])
], VehicleNameController);
