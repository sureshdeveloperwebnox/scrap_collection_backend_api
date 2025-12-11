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
exports.ScrapYardController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const scrapyard_1 = require("../services/scrapyard");
const scrapyard_rules_1 = require("../rules/scrapyard.rules");
const api_result_1 = require("../../utils/api-result");
let ScrapYardController = class ScrapYardController {
    constructor() {
        this.scrapYardService = new scrapyard_1.ScrapYardService();
    }
    async createScrapYard(req, res) {
        try {
            const result = await this.scrapYardService.createScrapYard(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createScrapYard", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getScrapYards(req, res) {
        try {
            const result = await this.scrapYardService.getScrapYards(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getScrapYards", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getScrapYardById(req, res) {
        try {
            const id = req.params.id;
            const result = await this.scrapYardService.getScrapYardById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getScrapYardById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateScrapYard(req, res) {
        try {
            const id = req.params.id;
            const result = await this.scrapYardService.updateScrapYard(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updateScrapYard", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteScrapYard(req, res) {
        try {
            const id = req.params.id;
            const result = await this.scrapYardService.deleteScrapYard(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deleteScrapYard", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.ScrapYardController = ScrapYardController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([scrapyard_rules_1.createScrapYardSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapYardController.prototype, "createScrapYard", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([scrapyard_rules_1.scrapYardQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapYardController.prototype, "getScrapYards", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([scrapyard_rules_1.scrapYardIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapYardController.prototype, "getScrapYardById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([scrapyard_rules_1.scrapYardIdSchema, scrapyard_rules_1.updateScrapYardSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapYardController.prototype, "updateScrapYard", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([scrapyard_rules_1.scrapYardIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapYardController.prototype, "deleteScrapYard", null);
exports.ScrapYardController = ScrapYardController = __decorate([
    (0, controller_decorator_1.Controller)('/scrap-yards'),
    __metadata("design:paramtypes", [])
], ScrapYardController);
