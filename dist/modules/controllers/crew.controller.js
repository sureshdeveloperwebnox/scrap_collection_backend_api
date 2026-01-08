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
exports.CrewController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const authenticate_decorator_1 = require("../../decorators/authenticate.decorator");
const user_category_enum_1 = require("../../utils/user-category.enum");
const crew_1 = require("../services/crew");
const api_result_1 = require("../../utils/api-result");
let CrewController = class CrewController {
    constructor() {
        this.crewService = new crew_1.CrewService();
    }
    async create(req, res) {
        var _a;
        try {
            // SECURITY: Extract organizationId from authenticated user
            const userOrganizationId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId)
                ? parseInt(req.user.organizationId)
                : undefined;
            if (!userOrganizationId) {
                api_result_1.ApiResult.error("Organization ID not found", 400).send(res);
                return;
            }
            const data = {
                ...req.body,
                organizationId: userOrganizationId
            };
            const result = await this.crewService.createCrew(data);
            result.send(res);
        }
        catch (error) {
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getAll(req, res) {
        var _a;
        try {
            // SECURITY: Extract organizationId from authenticated user
            const userOrganizationId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId)
                ? parseInt(req.user.organizationId)
                : undefined;
            if (!userOrganizationId) {
                api_result_1.ApiResult.error("Organization ID not found", 400).send(res);
                return;
            }
            const result = await this.crewService.getAllCrews(userOrganizationId);
            result.send(res);
        }
        catch (error) {
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await this.crewService.getCrewById(id);
            result.send(res);
        }
        catch (error) {
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await this.crewService.updateCrew(id, data);
            result.send(res);
        }
        catch (error) {
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await this.crewService.deleteCrew(id);
            result.send(res);
        }
        catch (error) {
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.CrewController = CrewController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CrewController.prototype, "create", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CrewController.prototype, "getAll", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CrewController.prototype, "getById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CrewController.prototype, "update", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CrewController.prototype, "delete", null);
exports.CrewController = CrewController = __decorate([
    (0, controller_decorator_1.Controller)('/crews'),
    __metadata("design:paramtypes", [])
], CrewController);
