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
exports.LeadController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const authenticate_decorator_1 = require("../../decorators/authenticate.decorator");
const user_category_enum_1 = require("../../utils/user-category.enum");
const lead_1 = require("../services/lead");
const lead_rules_1 = require("../rules/lead.rules");
const api_result_1 = require("../../utils/api-result");
let LeadController = class LeadController {
    constructor() {
        this.leadService = new lead_1.LeadService();
    }
    async createLead(req, res) {
        try {
            const result = await this.leadService.createLead(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createLead", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getLeads(req, res) {
        var _a;
        try {
            // SECURITY: Extract organizationId from authenticated user
            const userOrganizationId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId)
                ? parseInt(req.user.organizationId)
                : undefined;
            const queryWithOrgId = {
                ...req.query,
                organizationId: userOrganizationId
            };
            const result = await this.leadService.getLeads(queryWithOrgId);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getLeads", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getLeadById(req, res) {
        try {
            const id = req.params.id;
            const result = await this.leadService.getLeadById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getLeadById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateLead(req, res) {
        try {
            const id = req.params.id;
            const result = await this.leadService.updateLead(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updateLead", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteLead(req, res) {
        try {
            const id = req.params.id;
            const result = await this.leadService.deleteLead(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deleteLead", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async convertLead(req, res) {
        try {
            const id = req.params.id;
            const result = await this.leadService.convertLeadToOrder(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in convertLead", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getLeadTimeline(req, res) {
        try {
            const id = req.params.id;
            const result = await this.leadService.getLeadTimeline(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getLeadTimeline", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getLeadStats(req, res) {
        var _a;
        try {
            // SECURITY: Use authenticated user's organizationId, ignore URL param
            const userOrganizationId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId)
                ? parseInt(req.user.organizationId)
                : undefined;
            if (!userOrganizationId) {
                api_result_1.ApiResult.error("Organization ID not found", 400).send(res);
                return;
            }
            const result = await this.leadService.getLeadStats(userOrganizationId);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getLeadStats", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async convertLeadToCustomer(req, res) {
        try {
            const id = req.params.id;
            const result = await this.leadService.convertLeadToCustomer(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in convertLeadToCustomer", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.LeadController = LeadController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    (0, middleware_decorator_1.Validate)([lead_rules_1.createLeadSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "createLead", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    (0, middleware_decorator_1.Validate)([lead_rules_1.leadQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "getLeads", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([lead_rules_1.leadIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "getLeadById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([lead_rules_1.leadIdSchema, lead_rules_1.updateLeadSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "updateLead", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([lead_rules_1.leadIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "deleteLead", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id/convert'),
    (0, middleware_decorator_1.Validate)([lead_rules_1.leadIdSchema, lead_rules_1.convertLeadSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "convertLead", null);
__decorate([
    (0, method_decorator_1.GET)('/:id/timeline'),
    (0, middleware_decorator_1.Validate)([lead_rules_1.leadIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "getLeadTimeline", null);
__decorate([
    (0, method_decorator_1.GET)('/stats/:organizationId'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "getLeadStats", null);
__decorate([
    (0, method_decorator_1.POST)('/:id/convert-to-customer'),
    (0, middleware_decorator_1.Validate)([lead_rules_1.leadIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "convertLeadToCustomer", null);
exports.LeadController = LeadController = __decorate([
    (0, controller_decorator_1.Controller)('/leads'),
    __metadata("design:paramtypes", [])
], LeadController);
