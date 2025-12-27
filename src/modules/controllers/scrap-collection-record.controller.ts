import { Request, Response } from 'express';
import { Controller, GET } from '../../decorators';
import { Authenticate } from '../../decorators/authenticate.decorator';
import { UserCategory } from '../../utils/user-category.enum';
import { ScrapCollectionRecordService } from '../services/scrap-collection-record';
import { ApiResult } from '../../utils/api-result';

/**
 * Dashboard Scrap Collection Record Controller
 * Handles scrap collection record viewing for dashboard/admin users
 * 
 * Base path: /scrap-collections
 */
@Controller('/scrap-collections')
export class ScrapCollectionRecordController {
    private service: ScrapCollectionRecordService;

    constructor() {
        this.service = new ScrapCollectionRecordService();
    }

    /**
     * GET /scrap-collections/work-order/:workOrderId
     * Get all collection records for a specific work order
     */
    @GET('/work-order/:workOrderId')
    @Authenticate([UserCategory.ALL])
    public async getRecordsByWorkOrder(req: Request, res: Response): Promise<void> {
        try {
            const { workOrderId } = req.params;

            if (!workOrderId) {
                ApiResult.error('Work Order ID is required', 400).send(res);
                return;
            }

            const result = await this.service.getRecordsByWorkOrder(workOrderId);
            result.send(res);
        } catch (error) {
            console.error('Error in getRecordsByWorkOrder:', error);
            ApiResult.error((error as any).message || 'Failed to fetch collection records', 500).send(res);
        }
    }

    /**
     * GET /scrap-collections/:id/pdf-data
     * Get PDF data for a collection record (for dashboard users)
     */
    @GET('/:id/pdf-data')
    @Authenticate([UserCategory.ALL])
    public async getPDFData(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                ApiResult.error('Record ID is required', 400).send(res);
                return;
            }

            const result = await this.service.getPDFDataById(id);
            result.send(res);
        } catch (error) {
            console.error('Error in getPDFData:', error);
            ApiResult.error((error as any).message || 'Failed to generate PDF data', 500).send(res);
        }
    }
}
