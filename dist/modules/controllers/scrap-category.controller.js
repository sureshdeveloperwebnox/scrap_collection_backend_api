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
exports.ScrapCategoryController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const scrap_category_1 = require("../services/scrap-category");
const scrap_category_rules_1 = require("../rules/scrap-category.rules");
const api_result_1 = require("../../utils/api-result");
let ScrapCategoryController = class ScrapCategoryController {
    constructor() {
        this.scrapCategoryService = new scrap_category_1.ScrapCategoryService();
    }
    async createScrapCategory(req, res) {
        try {
            const result = await this.scrapCategoryService.createScrapCategory(req.body);
            result.send(res);
        }
        catch (error) {
            console.log('Error in createScrapCategory', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getScrapCategories(req, res) {
        try {
            const result = await this.scrapCategoryService.getScrapCategories(req.query);
            result.send(res);
        }
        catch (error) {
            console.log('Error in getScrapCategories', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getScrapCategoryById(req, res) {
        try {
            const id = req.params.id;
            const result = await this.scrapCategoryService.getScrapCategoryById(id);
            result.send(res);
        }
        catch (error) {
            console.log('Error in getScrapCategoryById', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateScrapCategory(req, res) {
        try {
            const id = req.params.id;
            const result = await this.scrapCategoryService.updateScrapCategory(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log('Error in updateScrapCategory', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteScrapCategory(req, res) {
        try {
            const id = req.params.id;
            const result = await this.scrapCategoryService.deleteScrapCategory(id);
            result.send(res);
        }
        catch (error) {
            console.log('Error in deleteScrapCategory', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.ScrapCategoryController = ScrapCategoryController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([scrap_category_rules_1.createScrapCategorySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapCategoryController.prototype, "createScrapCategory", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([scrap_category_rules_1.scrapCategoryQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapCategoryController.prototype, "getScrapCategories", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([scrap_category_rules_1.scrapCategoryIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapCategoryController.prototype, "getScrapCategoryById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([scrap_category_rules_1.scrapCategoryIdSchema, scrap_category_rules_1.updateScrapCategorySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapCategoryController.prototype, "updateScrapCategory", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([scrap_category_rules_1.scrapCategoryIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapCategoryController.prototype, "deleteScrapCategory", null);
exports.ScrapCategoryController = ScrapCategoryController = __decorate([
    (0, controller_decorator_1.Controller)('/scrap-categories'),
    __metadata("design:paramtypes", [])
], ScrapCategoryController);
