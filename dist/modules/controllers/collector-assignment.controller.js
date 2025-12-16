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
exports.CollectorAssignmentController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const collector_assignment_1 = require("../services/collector-assignment");
const collector_assignment_rules_1 = require("../rules/collector-assignment.rules");
const api_result_1 = require("../../utils/api-result");
let CollectorAssignmentController = class CollectorAssignmentController {
    constructor() {
        this.collectorAssignmentService = new collector_assignment_1.CollectorAssignmentService();
    }
    async createCollectorAssignment(req, res) {
        try {
            const result = await this.collectorAssignmentService.createCollectorAssignment(req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in createCollectorAssignment", error);
            api_result_1.ApiResult.error("Error in createCollectorAssignment", 500).send(res);
        }
    }
    async getCollectorAssignments(req, res) {
        try {
            const result = await this.collectorAssignmentService.getCollectorAssignments(req.query);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCollectorAssignments", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async getCollectorAssignmentById(req, res) {
        try {
            const id = req.params.id;
            const result = await this.collectorAssignmentService.getCollectorAssignmentById(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in getCollectorAssignmentById", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async updateCollectorAssignment(req, res) {
        try {
            const id = req.params.id;
            const result = await this.collectorAssignmentService.updateCollectorAssignment(id, req.body);
            result.send(res);
        }
        catch (error) {
            console.log("Error in updateCollectorAssignment", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteCollectorAssignment(req, res) {
        try {
            const id = req.params.id;
            const result = await this.collectorAssignmentService.deleteCollectorAssignment(id);
            result.send(res);
        }
        catch (error) {
            console.log("Error in deleteCollectorAssignment", error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.CollectorAssignmentController = CollectorAssignmentController;
__decorate([
    (0, method_decorator_1.POST)('/'),
    (0, middleware_decorator_1.Validate)([collector_assignment_rules_1.createCollectorAssignmentSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectorAssignmentController.prototype, "createCollectorAssignment", null);
__decorate([
    (0, method_decorator_1.GET)('/'),
    (0, middleware_decorator_1.Validate)([collector_assignment_rules_1.collectorAssignmentQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectorAssignmentController.prototype, "getCollectorAssignments", null);
__decorate([
    (0, method_decorator_1.GET)('/:id'),
    (0, middleware_decorator_1.Validate)([collector_assignment_rules_1.collectorAssignmentIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectorAssignmentController.prototype, "getCollectorAssignmentById", null);
__decorate([
    (0, method_decorator_1.PUT)('/:id'),
    (0, middleware_decorator_1.Validate)([collector_assignment_rules_1.collectorAssignmentIdSchema, collector_assignment_rules_1.updateCollectorAssignmentSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectorAssignmentController.prototype, "updateCollectorAssignment", null);
__decorate([
    (0, method_decorator_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Validate)([collector_assignment_rules_1.collectorAssignmentIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectorAssignmentController.prototype, "deleteCollectorAssignment", null);
exports.CollectorAssignmentController = CollectorAssignmentController = __decorate([
    (0, controller_decorator_1.Controller)('/collector-assignments'),
    __metadata("design:paramtypes", [])
], CollectorAssignmentController);
