import { RequestX } from '../../utils/request.interface';
import { Controller, GET, POST, PUT, DELETE } from '../../decorators';
import { Authenticate } from '../../decorators/authenticate.decorator';
import { InvoiceService } from '../services/invoice.service';
import { ApiResult } from '../../utils/api-result';
import { UserCategory } from '../../utils/user-category.enum';

@Controller('/invoices')
export class InvoiceController {
    private invoiceService!: InvoiceService;

    @POST('/')
    @Authenticate([UserCategory.ALL])
    public async createInvoice(req: RequestX): Promise<ApiResult> {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId) {
                return ApiResult.error('Unauthorized', 401);
            }

            const invoice = await this.getInstance().createInvoice(req.body, organizationId);
            return ApiResult.success(invoice, 'Invoice created successfully', 201);
        } catch (error: any) {
            return ApiResult.error(error.message || 'Failed to create invoice', 500);
        }
    }

    @GET('/')
    @Authenticate([UserCategory.ALL])
    public async getInvoices(req: RequestX): Promise<ApiResult> {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId) {
                return ApiResult.error('Unauthorized', 401);
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as any;
            const customerId = req.query.customerId as string;
            const workOrderId = req.query.workOrderId as string;
            const search = req.query.search as string;
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;

            const result = await this.getInstance().getInvoices(
                organizationId,
                page,
                limit,
                status,
                customerId,
                workOrderId,
                search,
                startDate,
                endDate
            );

            return ApiResult.success(result, 'Invoices retrieved successfully');
        } catch (error: any) {
            return ApiResult.error(error.message || 'Failed to retrieve invoices', 500);
        }
    }

    @GET('/stats')
    @Authenticate([UserCategory.ALL])
    public async getInvoiceStats(req: RequestX): Promise<ApiResult> {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId) {
                return ApiResult.error('Unauthorized', 401);
            }

            const stats = await this.getInstance().getInvoiceStats(organizationId);
            return ApiResult.success(stats, 'Invoice stats retrieved successfully');
        } catch (error: any) {
            return ApiResult.error(error.message || 'Failed to retrieve invoice stats', 500);
        }
    }

    @GET('/customer/:customerId')
    @Authenticate([UserCategory.ALL])
    public async getInvoicesByCustomer(req: RequestX): Promise<ApiResult> {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId) {
                return ApiResult.error('Unauthorized', 401);
            }

            const { customerId } = req.params;
            const invoices = await this.getInstance().getInvoicesByCustomer(customerId, organizationId);
            return ApiResult.success(invoices, 'Customer invoices retrieved successfully');
        } catch (error: any) {
            return ApiResult.error(error.message || 'Failed to retrieve customer invoices', 500);
        }
    }

    @GET('/work-order/:workOrderId')
    @Authenticate([UserCategory.ALL])
    public async getInvoicesByWorkOrder(req: RequestX): Promise<ApiResult> {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId) {
                return ApiResult.error('Unauthorized', 401);
            }

            const { workOrderId } = req.params;
            const invoices = await this.getInstance().getInvoicesByWorkOrder(workOrderId, organizationId);
            return ApiResult.success(invoices, 'Work order invoices retrieved successfully');
        } catch (error: any) {
            return ApiResult.error(error.message || 'Failed to retrieve work order invoices', 500);
        }
    }

    @GET('/:id')
    @Authenticate([UserCategory.ALL])
    public async getInvoiceById(req: RequestX): Promise<ApiResult> {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId) {
                return ApiResult.error('Unauthorized', 401);
            }

            const { id } = req.params;
            const invoice = await this.getInstance().getInvoiceById(id, organizationId);
            return ApiResult.success(invoice, 'Invoice retrieved successfully');
        } catch (error: any) {
            return ApiResult.error(error.message || 'Invoice not found', 404);
        }
    }

    @PUT('/:id')
    @Authenticate([UserCategory.ALL])
    public async updateInvoice(req: RequestX): Promise<ApiResult> {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId) {
                return ApiResult.error('Unauthorized', 401);
            }

            const { id } = req.params;
            const invoice = await this.getInstance().updateInvoice(id, req.body, organizationId);
            return ApiResult.success(invoice, 'Invoice updated successfully');
        } catch (error: any) {
            return ApiResult.error(error.message || 'Failed to update invoice', 500);
        }
    }

    @PUT('/:id/status')
    @Authenticate([UserCategory.ALL])
    public async updateStatus(req: RequestX): Promise<ApiResult> {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId) {
                return ApiResult.error('Unauthorized', 401);
            }

            const { id } = req.params;
            const { status } = req.body;
            if (!status) {
                return ApiResult.error('Status is required', 400);
            }

            const invoice = await this.getInstance().updateInvoiceStatus(id, status, organizationId);
            return ApiResult.success(invoice, 'Invoice status updated successfully');
        } catch (error: any) {
            return ApiResult.error(error.message || 'Failed to update status', 500);
        }
    }

    @POST('/:id/cancel')
    @Authenticate([UserCategory.ALL])
    public async cancelInvoice(req: RequestX): Promise<ApiResult> {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId) {
                return ApiResult.error('Unauthorized', 401);
            }

            const { id } = req.params;
            const { reason } = req.body;
            if (!reason) {
                return ApiResult.error('Reason is required', 400);
            }

            const result = await this.getInstance().cancelInvoice(id, reason, organizationId);
            return ApiResult.success(result.invoice, result.message);
        } catch (error: any) {
            return ApiResult.error(error.message || 'Failed to cancel invoice', 500);
        }
    }

    @GET('/:id/history')
    @Authenticate([UserCategory.ALL])
    public async getHistory(req: RequestX): Promise<ApiResult> {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId) {
                return ApiResult.error('Unauthorized', 401);
            }

            const { id } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.getInstance().getInvoiceHistory(id, organizationId, page, limit);
            return ApiResult.success(result, 'Invoice history retrieved successfully');
        } catch (error: any) {
            return ApiResult.error(error.message || 'Failed to retrieve history', 500);
        }
    }

    @GET('/:id/download')
    @Authenticate([UserCategory.ALL])
    public async downloadInvoice(req: RequestX): Promise<ApiResult> {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId) {
                return ApiResult.error('Unauthorized', 401);
            }

            const { id } = req.params;
            const data = await this.getInstance().generatePDF(id, organizationId);
            return ApiResult.success(data, 'Invoice PDF data generated successfully');
        } catch (error: any) {
            return ApiResult.error(error.message || 'Failed to generate PDF', 500);
        }
    }

    private getInstance(): InvoiceService {
        if (!this.invoiceService) {
            this.invoiceService = new InvoiceService();
        }
        return this.invoiceService;
    }
}
