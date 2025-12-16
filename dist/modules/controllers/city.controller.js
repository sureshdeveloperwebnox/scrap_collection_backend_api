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
exports.CityController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const city_1 = require("../services/city");
const city_rules_1 = require("../rules/city.rules");
const api_result_1 = require("../../utils/api-result");
let CityController = class CityController {
    constructor() {
        this.cityService = new city_1.CityService();
    }
    async createCity(req, res) {
        try {
            const result = await this.cityService.createCity(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createCity", error);
            api_result_1.ApiResult.error("Error in createCity", 500).send(res);
        }
    }
    async getCities(req, res) {
        try {
            const result = await this.cityService.getCities(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCities", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getCityById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.cityService.getCityById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCityById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateCity(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.cityService.updateCity(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updateCity", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteCity(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.cityService.deleteCity(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deleteCity", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.CityController = CityController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([city_rules_1.createCitySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CityController.prototype, "createCity", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([city_rules_1.cityQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CityController.prototype, "getCities", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([city_rules_1.cityIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CityController.prototype, "getCityById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([city_rules_1.cityIdSchema, city_rules_1.updateCitySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CityController.prototype, "updateCity", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([city_rules_1.cityIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CityController.prototype, "deleteCity", null);
exports.CityController = CityController = __decorate([
    (0, controller_decorator_1.Controller)('/cities'),
    __metadata("design:paramtypes", [])
], CityController);
