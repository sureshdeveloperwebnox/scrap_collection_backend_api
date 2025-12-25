import { Request, Response } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { Authenticate } from '../../decorators/authenticate.decorator';
import { UserCategory } from '../../utils/user-category.enum';
import { EmployeeService } from '../services/employee';
import { employeeQuerySchema } from '../rules/employee.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/collectors')
export class CollectorController {
    private employeeService: EmployeeService;

    constructor() {
        this.employeeService = new EmployeeService();
    }

    @GET('/stats')
    @Authenticate([UserCategory.ALL])
    public async getCollectorStats(req: Request, res: Response): Promise<void> {
        try {
            // SECURITY: Extract organizationId from authenticated user
            const userOrganizationId = (req as any).user?.organizationId
                ? parseInt((req as any).user.organizationId)
                : undefined;

            if (!userOrganizationId) {
                ApiResult.error("Organization ID not found", 400).send(res);
                return;
            }

            // Get employee stats filtered by collector role
            const result = await this.employeeService.getEmployeeStats(userOrganizationId);

            // Rename the response for collectors context
            if (result && typeof result.send === 'function') {
                result.send(res);
            } else {
                ApiResult.success(result, 'Collector statistics retrieved successfully').send(res);
            }
        } catch (error) {
            console.log("Error in getCollectorStats", error);
            ApiResult.error((error as any).message, 500).send(res);
        }
    }

    @GET('/')
    @Authenticate([UserCategory.ALL])
    @Validate([employeeQuerySchema])
    public async getCollectors(req: Request, res: Response): Promise<void> {
        try {
            // SECURITY: Extract organizationId from authenticated user
            const userOrganizationId = (req as any).user?.organizationId
                ? parseInt((req as any).user.organizationId)
                : undefined;

            const queryWithOrgId = {
                ...req.query,
                organizationId: userOrganizationId
            };

            const result = await this.employeeService.getEmployees(queryWithOrgId);
            result.send(res);
        } catch (error) {
            console.log("Error in getCollectors", error);
            ApiResult.error((error as any).message, 500).send(res);
        }
    }

    @GET('/:id')
    @Authenticate([UserCategory.ALL])
    public async getCollectorById(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const result = await this.employeeService.getEmployeeById(id);
            result.send(res);
        } catch (error) {
            console.log("Error in getCollectorById", error);
            ApiResult.error((error as any).message, 500).send(res);
        }
    }

    @GET('/:id/performance')
    @Authenticate([UserCategory.ALL])
    public async getCollectorPerformance(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const result = await this.employeeService.getEmployeePerformance(id);
            result.send(res);
        } catch (error) {
            console.log("Error in getCollectorPerformance", error);
            ApiResult.error((error as any).message, 500).send(res);
        }
    }
}
