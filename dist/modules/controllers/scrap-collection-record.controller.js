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
exports.ScrapCollectionRecordController = void 0;
const decorators_1 = require("../../decorators");
const authenticate_decorator_1 = require("../../decorators/authenticate.decorator");
const user_category_enum_1 = require("../../utils/user-category.enum");
const scrap_collection_record_1 = require("../services/scrap-collection-record");
const api_result_1 = require("../../utils/api-result");
/**
 * Dashboard Scrap Collection Record Controller
 * Handles scrap collection record viewing for dashboard/admin users
 *
 * Base path: /scrap-collections
 */
let ScrapCollectionRecordController = class ScrapCollectionRecordController {
    constructor() {
        this.service = new scrap_collection_record_1.ScrapCollectionRecordService();
    }
    /**
     * GET /scrap-collections/work-order/:workOrderId
     * Get all collection records for a specific work order
     */
    async getRecordsByWorkOrder(req, res) {
        try {
            const { workOrderId } = req.params;
            if (!workOrderId) {
                api_result_1.ApiResult.error('Work Order ID is required', 400).send(res);
                return;
            }
            const result = await this.service.getRecordsByWorkOrder(workOrderId);
            result.send(res);
        }
        catch (error) {
            console.error('Error in getRecordsByWorkOrder:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to fetch collection records', 500).send(res);
        }
    }
    /**
     * GET /scrap-collections/:id/pdf-data
     * Get PDF data for a collection record (for dashboard users)
     */
    async getPDFData(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                api_result_1.ApiResult.error('Record ID is required', 400).send(res);
                return;
            }
            const result = await this.service.getPDFDataById(id);
            result.send(res);
        }
        catch (error) {
            console.error('Error in getPDFData:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to generate PDF data', 500).send(res);
        }
    }
};
exports.ScrapCollectionRecordController = ScrapCollectionRecordController;
__decorate([
    (0, decorators_1.GET)('/work-order/:workOrderId'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapCollectionRecordController.prototype, "getRecordsByWorkOrder", null);
__decorate([
    (0, decorators_1.GET)('/:id/pdf-data'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapCollectionRecordController.prototype, "getPDFData", null);
exports.ScrapCollectionRecordController = ScrapCollectionRecordController = __decorate([
    (0, decorators_1.Controller)('/scrap-collections'),
    __metadata("design:paramtypes", [])
], ScrapCollectionRecordController);
