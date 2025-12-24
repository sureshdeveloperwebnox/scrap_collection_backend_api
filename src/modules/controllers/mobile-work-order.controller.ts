import { Request, Response } from 'express';
import { Controller, GET, PUT } from '../../decorators';
import { Validate } from '../../decorators/middleware.decorator';
import { Middleware } from '../../decorators/middleware.decorator';
import { mobileAuthMiddleware } from '../../middlewares/mobile-auth.middleware';
import { MobileWorkOrderService } from '../services/mobile-work-order';
import {
    mobileWorkOrderQuerySchema,
    mobileWorkOrderIdSchema,
    mobileUpdateWorkOrderStatusSchema
} from '../rules/mobile-work-order.rules';
import { ApiResult } from '../../utils/api-result';

/**
 * Mobile Work Orders Controller
 * Handles all work order operations for mobile collectors
 * 
 * Base path: /mobile/work-orders
 */
@Controller('/mobile/work-orders')
export class MobileWorkOrderController {
    private workOrderService: MobileWorkOrderService;

    constructor() {
        this.workOrderService = new MobileWorkOrderService();
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
    @GET('/')
    @Middleware([mobileAuthMiddleware])
    @Validate([mobileWorkOrderQuerySchema])
    public async getWorkOrders(req: Request, res: Response): Promise<void> {
        try {
            // Get collector ID from authenticated token
            const collectorId = (req as any).user?.id;

            if (!collectorId) {
                ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }

            // Extract collector location if provided
            const collectorLocation = req.query.collectorLat && req.query.collectorLon
                ? {
                    lat: parseFloat(req.query.collectorLat as string),
                    lon: parseFloat(req.query.collectorLon as string)
                }
                : undefined;

            const result = await this.workOrderService.getWorkOrders(
                collectorId,
                req.query,
                collectorLocation
            );

            result.send(res);
        } catch (error) {
            console.error('Error in getWorkOrders:', error);
            ApiResult.error((error as any).message || 'Failed to fetch work orders', 500).send(res);
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
    @GET('/:id')
    @Middleware([mobileAuthMiddleware])
    @Validate([mobileWorkOrderIdSchema])
    public async getWorkOrderById(req: Request, res: Response): Promise<void> {
        try {
            const collectorId = (req as any).user?.id;

            if (!collectorId) {
                ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }

            const { id } = req.params;

            const result = await this.workOrderService.getWorkOrderById(collectorId, id);
            result.send(res);
        } catch (error) {
            console.error('Error in getWorkOrderById:', error);
            ApiResult.error((error as any).message || 'Failed to fetch work order', 500).send(res);
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
    @PUT('/:id/status')
    @Middleware([mobileAuthMiddleware])
    @Validate([mobileWorkOrderIdSchema, mobileUpdateWorkOrderStatusSchema])
    public async updateWorkOrderStatus(req: Request, res: Response): Promise<void> {
        try {
            const collectorId = (req as any).user?.id;

            if (!collectorId) {
                ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }

            const { id } = req.params;

            const result = await this.workOrderService.updateWorkOrderStatus(
                collectorId,
                id,
                req.body
            );

            result.send(res);
        } catch (error) {
            console.error('Error in updateWorkOrderStatus:', error);
            ApiResult.error((error as any).message || 'Failed to update work order status', 500).send(res);
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
    @GET('/stats/dashboard')
    @Middleware([mobileAuthMiddleware])
    public async getCollectorStats(req: Request, res: Response): Promise<void> {
        try {
            const collectorId = (req as any).user?.id;

            if (!collectorId) {
                ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }

            const result = await this.workOrderService.getCollectorStats(collectorId);
            result.send(res);
        } catch (error) {
            console.error('Error in getCollectorStats:', error);
            ApiResult.error((error as any).message || 'Failed to fetch collector statistics', 500).send(res);
        }
    }
}
