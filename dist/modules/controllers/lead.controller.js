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
        try {
            const result = await this.leadService.getLeads(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getLeads", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getLeadById(req, res) {
        try {
            const id = parseInt(req.params.id);
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
            const id = parseInt(req.params.id);
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
            const id = parseInt(req.params.id);
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
            const id = parseInt(req.params.id);
            const { status } = req.body;
            const result = await this.leadService.convertLead(id, status);
            result.send(res);
        }
        catch (error) {
            console.log("Error in convertLead", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getLeadStats(req, res) {
        try {
            const organizationId = parseInt(req.params.organizationId);
            const result = await this.leadService.getLeadStats(organizationId);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getLeadStats", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.LeadController = LeadController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([lead_rules_1.createLeadSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "createLead", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
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
    (0, method_decorator_1.GET)('/stats/:organizationId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "getLeadStats", null);
exports.LeadController = LeadController = __decorate([
    (0, controller_decorator_1.Controller)('/leads'),
    __metadata("design:paramtypes", [])
], LeadController);
