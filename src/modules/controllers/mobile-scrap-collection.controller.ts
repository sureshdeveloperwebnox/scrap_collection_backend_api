import { Request, Response } from 'express';
import { Controller, GET, POST, PUT, DELETE } from '../../decorators';
import { Validate, Middleware } from '../../decorators/middleware.decorator';
import { mobileAuthMiddleware } from '../../middlewares/mobile-auth.middleware';
import { ScrapCollectionRecordService } from '../services/scrap-collection-record';
import {
    createScrapCollectionRecordSchema,
    updateScrapCollectionRecordSchema,
    scrapCollectionRecordQuerySchema,
    scrapCollectionRecordIdSchema
} from '../rules/scrap-collection-record.rules';
import { ApiResult } from '../../utils/api-result';

/**
 * Mobile Scrap Collection Record Controller
 * Handles scrap collection form operations for mobile collectors
 * 
 * Base path: /mobile/collection-records
 */
@Controller('/mobile/collection-records')
export class MobileScrapCollectionController {
    private service: ScrapCollectionRecordService;

    constructor() {
        this.service = new ScrapCollectionRecordService();
    }

    /**
     * GET /mobile/collection-records/form-helpers
     * Get helper data for the collection form
     * Returns: work orders, scrap categories, scrap names
     */
    @GET('/form-helpers')
    @Middleware([mobileAuthMiddleware])
    public async getFormHelpers(req: Request, res: Response): Promise<void> {
        try {
            const collectorId = (req as any).user?.id;

            if (!collectorId) {
                ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }

            const result = await this.service.getFormHelpers(collectorId);
            result.send(res);
        } catch (error) {
            console.error('Error in getFormHelpers:', error);
            ApiResult.error((error as any).message || 'Failed to fetch form helpers', 500).send(res);
        }
    }

    /**
     * POST /mobile/collection-records
     * Create a new scrap collection record
     */
    @POST('/')
    @Middleware([mobileAuthMiddleware])
    @Validate([createScrapCollectionRecordSchema])
    public async createRecord(req: Request, res: Response): Promise<void> {
        try {
            const collectorId = (req as any).user?.id;

            if (!collectorId) {
                ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }

            const result = await this.service.createRecord(collectorId, req.body);
            result.send(res);
        } catch (error) {
            console.error('Error in createRecord:', error);
            ApiResult.error((error as any).message || 'Failed to create collection record', 500).send(res);
        }
    }

    /**
     * GET /mobile/collection-records
     * Get list of collection records with filtering
     */
    @GET('/')
    @Middleware([mobileAuthMiddleware])
    @Validate([scrapCollectionRecordQuerySchema])
    public async getRecords(req: Request, res: Response): Promise<void> {
        try {
            const collectorId = (req as any).user?.id;

            if (!collectorId) {
                ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }

            const result = await this.service.getRecords(collectorId, req.query);
            result.send(res);
        } catch (error) {
            console.error('Error in getRecords:', error);
            ApiResult.error((error as any).message || 'Failed to fetch collection records', 500).send(res);
        }
    }

    /**
     * GET /mobile/collection-records/:id
     * Get single collection record by ID
     */
    @GET('/:id')
    @Middleware([mobileAuthMiddleware])
    @Validate([scrapCollectionRecordIdSchema])
    public async getRecordById(req: Request, res: Response): Promise<void> {
        try {
            const collectorId = (req as any).user?.id;

            if (!collectorId) {
                ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }

            const { id } = req.params;
            const result = await this.service.getRecordById(collectorId, id);
            result.send(res);
        } catch (error) {
            console.error('Error in getRecordById:', error);
            ApiResult.error((error as any).message || 'Failed to fetch collection record', 500).send(res);
        }
    }

    /**
     * PUT /mobile/collection-records/:id
     * Update a collection record
     */
    @PUT('/:id')
    @Middleware([mobileAuthMiddleware])
    @Validate([scrapCollectionRecordIdSchema, updateScrapCollectionRecordSchema])
    public async updateRecord(req: Request, res: Response): Promise<void> {
        try {
            const collectorId = (req as any).user?.id;

            if (!collectorId) {
                ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }

            const { id } = req.params;
            const result = await this.service.updateRecord(collectorId, id, req.body);
            result.send(res);
        } catch (error) {
            console.error('Error in updateRecord:', error);
            ApiResult.error((error as any).message || 'Failed to update collection record', 500).send(res);
        }
    }

    /**
     * DELETE /mobile/collection-records/:id
     * Delete a collection record (only drafts)
     */
    @DELETE('/:id')
    @Middleware([mobileAuthMiddleware])
    @Validate([scrapCollectionRecordIdSchema])
    public async deleteRecord(req: Request, res: Response): Promise<void> {
        try {
            const collectorId = (req as any).user?.id;

            if (!collectorId) {
                ApiResult.error('Collector not authenticated', 401).send(res);
                return;
            }

            const { id } = req.params;
            const result = await this.service.deleteRecord(collectorId, id);
            result.send(res);
        } catch (error) {
            console.error('Error in deleteRecord:', error);
            ApiResult.error((error as any).message || 'Failed to delete collection record', 500).send(res);
        }
    }
}
