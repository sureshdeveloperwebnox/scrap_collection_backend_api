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
exports.MobileWorkOrderController = void 0;
const decorators_1 = require("../../decorators");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const middleware_decorator_2 = require("../../decorators/middleware.decorator");
const mobile_auth_middleware_1 = require("../../middlewares/mobile-auth.middleware");
const mobile_work_order_1 = require("../services/mobile-work-order");
const mobile_work_order_rules_1 = require("../rules/mobile-work-order.rules");
const api_result_1 = require("../../utils/api-result");
/**
 * Mobile Work Orders Controller
 * Handles all work order operations for mobile collectors
 *
 * Base path: /mobile/work-orders
 */
let MobileWorkOrderController = class MobileWorkOrderController {
    constructor() {
        this.workOrderService = new mobile_work_order_1.MobileWorkOrderService();
    }
    /**
     * GET /mobile/work-orders
     * Get all work orders assigned to the logged-in collector
     *
     * Query Parameters:
     * - page: Page number (default: 1)
     * - limit: Items per page (default: 20)
     * - status: Filter by order status (can be comma-separated for multiple)
     * - paymentStatus: Filter by payment status
     * - dateFrom: Filter orders created from this date (ISO string)
     * - dateTo: Filter orders created until this date (ISO string)
     * - pickupDateFrom: Filter by scheduled pickup date from
     * - pickupDateTo: Filter by scheduled pickup date to
     * - yardId: Filter by assigned scrap yard
     * - nearLatitude: Latitude for nearby search
     * - nearLongitude: Longitude for nearby search
     * - radiusKm: Search radius in kilometers (default: 50)
     * - search: Search in customer name, phone, address, order number
     * - sortBy: Sort field (createdAt, pickupTime, quotedPrice, customerName, orderStatus)
     * - sortOrder: Sort direction (asc, desc)
     * - hasPhotos: Filter orders with/without photos (true/false)
     * - priceMin: Minimum quoted price
     * - priceMax: Maximum quoted price
     * - collectorLat: Collector's current latitude (for distance calculation)
     * - collectorLon: Collector's current longitude (for distance calculation)
     *
     * Response includes:
     * - Paginated list of work orders
     * - Summary statistics (counts by status, total revenue)
     * - Distance and estimated duration (if collector location provided)
     */
    async getWorkOrders(req, res) {
        var _a;
        try {
            // Get collector ID from authenticated token
            const collectorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!collectorId) {
                api_result_1.ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }
            // Extract collector location if provided
            const collectorLocation = req.query.collectorLat && req.query.collectorLon
                ? {
                    lat: parseFloat(req.query.collectorLat),
                    lon: parseFloat(req.query.collectorLon)
                }
                : undefined;
            const result = await this.workOrderService.getWorkOrders(collectorId, req.query, collectorLocation);
            result.send(res);
        }
        catch (error) {
            console.error('Error in getWorkOrders:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to fetch work orders', 500).send(res);
        }
    }
    /**
     * GET /mobile/work-orders/:id
     * Get detailed information about a specific work order
     *
     * Path Parameters:
     * - id: Work order UUID
     *
     * Response includes:
     * - Complete work order details
     * - Customer information
     * - Vehicle details
     * - Photos
     * - Timeline history
     * - Crew members (if assigned to crew)
     * - Payment information
     */
    async getWorkOrderById(req, res) {
        var _a;
        try {
            const collectorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!collectorId) {
                api_result_1.ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }
            const { id } = req.params;
            const result = await this.workOrderService.getWorkOrderById(collectorId, id);
            result.send(res);
        }
        catch (error) {
            console.error('Error in getWorkOrderById:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to fetch work order', 500).send(res);
        }
    }
    /**
     * PUT /mobile/work-orders/:id/status
     * Update the status of a work order
     *
     * Path Parameters:
     * - id: Work order UUID
     *
     * Request Body:
     * - status: New order status (ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED)
     * - notes: Optional notes about the status change
     * - actualPrice: Final price (required when marking as COMPLETED)
     * - completionPhotos: Array of photo URLs taken upon completion
     * - latitude: Collector's latitude when updating status
     * - longitude: Collector's longitude when updating status
     *
     * Status Transitions:
     * - PENDING → ASSIGNED, CANCELLED
     * - ASSIGNED → IN_PROGRESS, CANCELLED
     * - IN_PROGRESS → COMPLETED, CANCELLED
     * - COMPLETED → (no further changes)
     * - CANCELLED → (no further changes)
     */
    async updateWorkOrderStatus(req, res) {
        var _a;
        try {
            const collectorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!collectorId) {
                api_result_1.ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }
            const { id } = req.params;
            const result = await this.workOrderService.updateWorkOrderStatus(collectorId, id, req.body);
            result.send(res);
        }
        catch (error) {
            console.error('Error in updateWorkOrderStatus:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to update work order status', 500).send(res);
        }
    }
    /**
     * GET /mobile/work-orders/stats/dashboard
     * Get collector's performance statistics
     *
     * Response includes:
     * - Today's stats (assigned, completed, revenue)
     * - This week's stats
     * - This month's stats
     * - Overall stats (total completed, total revenue, average rating, completion rate)
     */
    async getCollectorStats(req, res) {
        var _a;
        try {
            const collectorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!collectorId) {
                api_result_1.ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }
            const result = await this.workOrderService.getCollectorStats(collectorId);
            result.send(res);
        }
        catch (error) {
            console.error('Error in getCollectorStats:', error);
            api_result_1.ApiResult.error(error.message || 'Failed to fetch collector statistics', 500).send(res);
        }
    }
};
exports.MobileWorkOrderController = MobileWorkOrderController;
__decorate([
    (0, decorators_1.GET)('/'),
    (0, middleware_decorator_2.Middleware)([mobile_auth_middleware_1.mobileAuthMiddleware]),
    (0, middleware_decorator_1.Validate)([mobile_work_order_rules_1.mobileWorkOrderQuerySchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileWorkOrderController.prototype, "getWorkOrders", null);
__decorate([
    (0, decorators_1.GET)('/:id'),
    (0, middleware_decorator_2.Middleware)([mobile_auth_middleware_1.mobileAuthMiddleware]),
    (0, middleware_decorator_1.Validate)([mobile_work_order_rules_1.mobileWorkOrderIdSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileWorkOrderController.prototype, "getWorkOrderById", null);
__decorate([
    (0, decorators_1.PUT)('/:id/status'),
    (0, middleware_decorator_2.Middleware)([mobile_auth_middleware_1.mobileAuthMiddleware]),
    (0, middleware_decorator_1.Validate)([mobile_work_order_rules_1.mobileWorkOrderIdSchema, mobile_work_order_rules_1.mobileUpdateWorkOrderStatusSchema]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileWorkOrderController.prototype, "updateWorkOrderStatus", null);
__decorate([
    (0, decorators_1.GET)('/stats/dashboard'),
    (0, middleware_decorator_2.Middleware)([mobile_auth_middleware_1.mobileAuthMiddleware]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileWorkOrderController.prototype, "getCollectorStats", null);
exports.MobileWorkOrderController = MobileWorkOrderController = __decorate([
    (0, decorators_1.Controller)('/mobile/work-orders'),
    __metadata("design:paramtypes", [])
], MobileWorkOrderController);
