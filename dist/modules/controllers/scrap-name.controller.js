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
exports.ScrapNameController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const scrap_name_1 = require("../services/scrap-name");
const scrap_name_rules_1 = require("../rules/scrap-name.rules");
const api_result_1 = require("../../utils/api-result");
let ScrapNameController = class ScrapNameController {
    constructor() {
        this.scrapNameService = new scrap_name_1.ScrapNameService();
    }
    async createScrapName(req, res) {
        try {
            const result = await this.scrapNameService.createScrapName(req.body);
            result.send(res);
        }
        catch (error) {
            console.log('Error in createScrapName', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getScrapNames(req, res) {
        try {
            const result = await this.scrapNameService.getScrapNames(req.query);
            result.send(res);
        }
        catch (error) {
            console.log('Error in getScrapNames', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getScrapNameById(req, res) {
        try {
            const id = req.params.id;
            const result = await this.scrapNameService.getScrapNameById(id);
            result.send(res);
        }
        catch (error) {
            console.log('Error in getScrapNameById', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateScrapName(req, res) {
        try {
            const id = req.params.id;
            const result = await this.scrapNameService.updateScrapName(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log('Error in updateScrapName', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteScrapName(req, res) {
        try {
            const id = req.params.id;
            const result = await this.scrapNameService.deleteScrapName(id);
            result.send(res);
        }
        catch (error) {
            console.log('Error in deleteScrapName', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.ScrapNameController = ScrapNameController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([scrap_name_rules_1.createScrapNameSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapNameController.prototype, "createScrapName", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([scrap_name_rules_1.scrapNameQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapNameController.prototype, "getScrapNames", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([scrap_name_rules_1.scrapNameIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapNameController.prototype, "getScrapNameById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([scrap_name_rules_1.scrapNameIdSchema, scrap_name_rules_1.updateScrapNameSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapNameController.prototype, "updateScrapName", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([scrap_name_rules_1.scrapNameIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapNameController.prototype, "deleteScrapName", null);
exports.ScrapNameController = ScrapNameController = __decorate([
    (0, controller_decorator_1.Controller)('/scrap-names'),
    __metadata("design:paramtypes", [])
], ScrapNameController);
