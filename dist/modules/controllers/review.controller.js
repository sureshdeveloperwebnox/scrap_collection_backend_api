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
exports.ReviewController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const review_1 = require("../services/review");
const review_rules_1 = require("../rules/review.rules");
const api_result_1 = require("../../utils/api-result");
let ReviewController = class ReviewController {
    constructor() {
        this.reviewService = new review_1.ReviewService();
    }
    async createReview(req, res) {
        try {
            const result = await this.reviewService.createReview(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createReview", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getReviews(req, res) {
        try {
            const result = await this.reviewService.getReviews(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getReviews", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getReviewById(req, res) {
        try {
            const id = req.params.id;
            const result = await this.reviewService.getReviewById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getReviewById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateReview(req, res) {
        try {
            const id = req.params.id;
            const result = await this.reviewService.updateReview(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updateReview", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.ReviewController = ReviewController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([review_rules_1.createReviewSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "createReview", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([review_rules_1.reviewQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getReviews", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([review_rules_1.reviewIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getReviewById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([review_rules_1.reviewIdSchema, review_rules_1.updateReviewSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "updateReview", null);
exports.ReviewController = ReviewController = __decorate([
    (0, controller_decorator_1.Controller)('/reviews'),
    __metadata("design:paramtypes", [])
], ReviewController);
