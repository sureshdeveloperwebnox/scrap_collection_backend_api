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
exports.MobileScrapCollectionController = void 0;
const decorators_1 = require("../../decorators");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const mobile_auth_middleware_1 = require("../../middlewares/mobile-auth.middleware");
const scrap_collection_record_1 = require("../services/scrap-collection-record");
const scrap_collection_record_rules_1 = require("../rules/scrap-collection-record.rules");
const api_result_1 = require("../../utils/api-result");
/**
 * Mobile Scrap Collection Record Controller
 * Handles scrap collection form operations for mobile collectors
 *
 * Base path: /mobile/scrap-collections
 */
let MobileScrapCollectionController = class MobileScrapCollectionController {
    constructor() {
        this.service = new scrap_collection_record_1.ScrapCollectionRecordService();
    }
    /**
     * GET /mobile/collection-records/form-helpers
     * Get helper data for the collection form
     * Returns: work orders, scrap categories, scrap names
     */
    async getFormHelpers(req, res) {
        var _a;
        try {
            const collectorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!collectorId) {
                api_result_1.ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }
            const result = await this.service.getFormHelpers(collectorId);
            result.send(res);
        }
        catch (error) {
            console.error('Error in getFormHelpers:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to fetch form helpers', 500).send(res);
        }
    }
    /**
     * POST /mobile/collection-records
     * Create a new scrap collection record
     */
    async createRecord(req, res) {
        var _a;
        try {
            const collectorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!collectorId) {
                api_result_1.ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }
            const result = await this.service.createRecord(collectorId, req.body);
            result.send(res);
        }
        catch (error) {
            console.error('Error in createRecord:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to create collection record', 500).send(res);
        }
    }
    /**
     * GET /mobile/collection-records
     * Get list of collection records with filtering
     */
    async getRecords(req, res) {
        var _a;
        try {
            const collectorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!collectorId) {
                api_result_1.ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }
            const result = await this.service.getRecords(collectorId, req.query);
            result.send(res);
        }
        catch (error) {
            console.error('Error in getRecords:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to fetch collection records', 500).send(res);
        }
    }
    /**
     * GET /mobile/collection-records/:id
     * Get single collection record by ID
     */
    async getRecordById(req, res) {
        var _a;
        try {
            const collectorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!collectorId) {
                api_result_1.ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }
            const { id } = req.params;
            const result = await this.service.getRecordById(collectorId, id);
            result.send(res);
        }
        catch (error) {
            console.error('Error in getRecordById:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to fetch collection record', 500).send(res);
        }
    }
    /**
     * PUT /mobile/collection-records/:id
     * Update a collection record
     */
    async updateRecord(req, res) {
        var _a;
        try {
            const collectorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!collectorId) {
                api_result_1.ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }
            const { id } = req.params;
            const result = await this.service.updateRecord(collectorId, id, req.body);
            result.send(res);
        }
        catch (error) {
            console.error('Error in updateRecord:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to update collection record', 500).send(res);
        }
    }
    /**
     * DELETE /mobile/collection-records/:id
     * Delete a collection record (only drafts)
     */
    async deleteRecord(req, res) {
        var _a;
        try {
            const collectorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!collectorId) {
                api_result_1.ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }
            const { id } = req.params;
            const result = await this.service.deleteRecord(collectorId, id);
            result.send(res);
        }
        catch (error) {
            console.error('Error in deleteRecord:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to delete collection record', 500).send(res);
        }
    }
    /**
     * GET /mobile/scrap-collections/:id/pdf
     * Generate PDF for a collection record
     */
    async downloadPDF(req, res) {
        var _a;
        try {
            const collectorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!collectorId) {
                api_result_1.ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }
            const { id } = req.params;
            const result = await this.service.generatePDF(collectorId, id);
            result.send(res);
        }
        catch (error) {
            console.error('Error in downloadPDF:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to generate PDF', 500).send(res);
        }
    }
};
exports.MobileScrapCollectionController = MobileScrapCollectionController;
__decorate([
    (0, decorators_1.GET)('/form-helpers'),
    (0, middleware_decorator_1.Middleware)([mobile_auth_middleware_1.mobileAuthMiddleware]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileScrapCollectionController.prototype, "getFormHelpers", null);
__decorate([
    (0, decorators_1.POST)('/'),
    (0, middleware_decorator_1.Middleware)([mobile_auth_middleware_1.mobileAuthMiddleware]),
    (0, middleware_decorator_1.Validate)([scrap_collection_record_rules_1.createScrapCollectionRecordSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileScrapCollectionController.prototype, "createRecord", null);
__decorate([
    (0, decorators_1.GET)('/'),
    (0, middleware_decorator_1.Middleware)([mobile_auth_middleware_1.mobileAuthMiddleware]),
    (0, middleware_decorator_1.Validate)([scrap_collection_record_rules_1.scrapCollectionRecordQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileScrapCollectionController.prototype, "getRecords", null);
__decorate([
    (0, decorators_1.GET)('/:id'),
    (0, middleware_decorator_1.Middleware)([mobile_auth_middleware_1.mobileAuthMiddleware]),
    (0, middleware_decorator_1.Validate)([scrap_collection_record_rules_1.scrapCollectionRecordIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileScrapCollectionController.prototype, "getRecordById", null);
__decorate([
    (0, decorators_1.PUT)('/:id'),
    (0, middleware_decorator_1.Middleware)([mobile_auth_middleware_1.mobileAuthMiddleware]),
    (0, middleware_decorator_1.Validate)([scrap_collection_record_rules_1.scrapCollectionRecordIdSchema, scrap_collection_record_rules_1.updateScrapCollectionRecordSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileScrapCollectionController.prototype, "updateRecord", null);
__decorate([
    (0, decorators_1.DELETE)('/:id'),
    (0, middleware_decorator_1.Middleware)([mobile_auth_middleware_1.mobileAuthMiddleware]),
    (0, middleware_decorator_1.Validate)([scrap_collection_record_rules_1.scrapCollectionRecordIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileScrapCollectionController.prototype, "deleteRecord", null);
__decorate([
    (0, decorators_1.GET)('/:id/pdf'),
    (0, middleware_decorator_1.Middleware)([mobile_auth_middleware_1.mobileAuthMiddleware]),
    (0, middleware_decorator_1.Validate)([scrap_collection_record_rules_1.scrapCollectionRecordIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileScrapCollectionController.prototype, "downloadPDF", null);
exports.MobileScrapCollectionController = MobileScrapCollectionController = __decorate([
    (0, decorators_1.Controller)('/mobile/scrap-collections'),
    __metadata("design:paramtypes", [])
], MobileScrapCollectionController);
