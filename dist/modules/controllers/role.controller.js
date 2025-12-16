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
exports.RoleController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const role_1 = require("../services/role");
const role_rules_1 = require("../rules/role.rules");
const api_result_1 = require("../../utils/api-result");
let RoleController = class RoleController {
    constructor() {
        this.roleService = new role_1.RoleService();
    }
    async createRole(req, res) {
        try {
            const result = await this.roleService.createRole(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createRole", error);
            api_result_1.ApiResult.error("Error in createRole", 500).send(res);
        }
    }
    async getRoles(req, res) {
        try {
            const result = await this.roleService.getRoles(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getRoles", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getRoleById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.roleService.getRoleById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getRoleById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateRole(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.roleService.updateRole(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updateRole", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteRole(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.roleService.deleteRole(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deleteRole", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async activateRole(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.roleService.activateRole(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in activateRole", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deactivateRole(req, res) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.roleService.deactivateRole(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deactivateRole", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.RoleController = RoleController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([role_rules_1.createRoleSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "createRole", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([role_rules_1.roleQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "getRoles", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([role_rules_1.roleIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "getRoleById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([role_rules_1.roleIdSchema, role_rules_1.updateRoleSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "updateRole", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([role_rules_1.roleIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "deleteRole", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id/activate'),
    (0, middleware_decorator_1.Validate)([role_rules_1.roleIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "activateRole", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id/deactivate'),
    (0, middleware_decorator_1.Validate)([role_rules_1.roleIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "deactivateRole", null);
exports.RoleController = RoleController = __decorate([
    (0, controller_decorator_1.Controller)('/roles'),
    __metadata("design:paramtypes", [])
], RoleController);
