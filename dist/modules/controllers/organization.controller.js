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
exports.OrganizationController = void 0;
const decorators_1 = require("../../decorators");
const authenticate_decorator_1 = require("../../decorators/authenticate.decorator");
const organization_rules_1 = require("../rules/organization.rules");
const organization_service_1 = require("../services/organization.service");
const api_result_1 = require("../../utils/api-result");
const user_category_enum_1 = require("../../utils/user-category.enum");
let OrganizationController = class OrganizationController {
    async createOrganization(req) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return api_result_1.ApiResult.error('Unauthorized', 401);
        }
        // Create organization
        const createResult = await this.getInstance().createOrganization(req.body);
        if (!createResult.success || !createResult.data) {
            return createResult;
        }
        // Link organization to user
        const linkResult = await this.getInstance().linkOrganizationToUser(userId, createResult.data.id);
        if (!linkResult.success) {
            return linkResult;
        }
        return api_result_1.ApiResult.success(createResult.data, 'Organization created and linked successfully', 201);
    }
    async getOrganization(req) {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return api_result_1.ApiResult.error('Invalid organization ID', 400);
        }
        return this.getInstance().getOrganizationById(id);
    }
    async getUserOrganization(req) {
        var _a, _b;
        const userId = req.params.userId;
        const requestingUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Users can only get their own organization unless they're admin
        if (userId !== requestingUserId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'ADMIN') {
            return api_result_1.ApiResult.error('Unauthorized', 403);
        }
        return this.getInstance().getOrganizationByUserId(userId);
    }
    async getMyOrganization(req) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return api_result_1.ApiResult.error('Unauthorized', 401);
        }
        return this.getInstance().getOrganizationByUserId(userId);
    }
    async updateOrganization(req) {
        var _a;
        const id = parseInt(req.params.id);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (isNaN(id)) {
            return api_result_1.ApiResult.error('Invalid organization ID', 400);
        }
        if (!userId) {
            return api_result_1.ApiResult.error('Unauthorized', 401);
        }
        // Verify user belongs to this organization
        const orgResult = await this.getInstance().getOrganizationByUserId(userId);
        if (!orgResult.success || !orgResult.data || orgResult.data.id !== id) {
            return api_result_1.ApiResult.error('Unauthorized to update this organization', 403);
        }
        return this.getInstance().updateOrganization(id, req.body);
    }
    async deleteOrganization(req) {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return api_result_1.ApiResult.error('Invalid organization ID', 400);
        }
        return this.getInstance().deleteOrganization(id);
    }
    getInstance() {
        if (!this.organizationService) {
            this.organizationService = new organization_service_1.OrganizationService();
        }
        return this.organizationService;
    }
};
exports.OrganizationController = OrganizationController;
__decorate([
    (0, decorators_1.POST)('/'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    (0, decorators_1.Validate)([organization_rules_1.forCreateOrganization]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "createOrganization", null);
__decorate([
    (0, decorators_1.GET)('/:id'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getOrganization", null);
__decorate([
    (0, decorators_1.GET)('/user/:userId'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getUserOrganization", null);
__decorate([
    (0, decorators_1.GET)('/me/organization'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getMyOrganization", null);
__decorate([
    (0, decorators_1.PUT)('/:id'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    (0, decorators_1.Validate)([organization_rules_1.forUpdateOrganization]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "updateOrganization", null);
__decorate([
    (0, decorators_1.DELETE)('/:id'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.Admin]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "deleteOrganization", null);
exports.OrganizationController = OrganizationController = __decorate([
    (0, decorators_1.Controller)('/organizations')
], OrganizationController);
