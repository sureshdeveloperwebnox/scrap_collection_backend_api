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
exports.CountryController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const country_1 = require("../services/country");
const country_rules_1 = require("../rules/country.rules");
const api_result_1 = require("../../utils/api-result");
let CountryController = class CountryController {
    constructor() {
        this.countryService = new country_1.CountryService();
    }
    async getCountries(req, res) {
        try {
            const result = await this.countryService.getCountries();
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCountries", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async createCountry(req, res) {
        try {
            const result = await this.countryService.createCountry(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createCountry", error);
            api_result_1.ApiResult.error(error.message, 500);
        }
    }
};
exports.CountryController = CountryController;
__decorate([
    (0, method_decorator_1.GET)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CountryController.prototype, "getCountries", null);
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([country_rules_1.createCountrySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CountryController.prototype, "createCountry", null);
exports.CountryController = CountryController = __decorate([
    (0, controller_decorator_1.Controller)('/country'),
    __metadata("design:paramtypes", [])
], CountryController);
