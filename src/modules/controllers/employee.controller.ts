import { Request, Response } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { Authenticate } from '../../decorators/authenticate.decorator';
import { UserCategory } from '../../utils/user-category.enum';
import { EmployeeService } from '../services/employee';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
  employeeIdSchema
} from '../rules/employee.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/employees')
export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }

  @GET('/stats/:organizationId')
  @Authenticate([UserCategory.ALL])
  public async getEmployeeStats(req: Request, res: Response): Promise<void> {
    try {
      // SECURITY: Use authenticated user's organizationId, ignore URL param
      const userOrganizationId = (req as any).user?.organizationId
        ? parseInt((req as any).user.organizationId)
        : undefined;

      if (!userOrganizationId) {
        ApiResult.error("Organization ID not found", 400).send(res);
        return;
      }

      const result = await this.employeeService.getEmployeeStats(userOrganizationId);
      result.send(res);
    } catch (error) {
      console.log("Error in getEmployeeStats", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @POST('/')
  @Authenticate([UserCategory.ALL])
  @Validate([createEmployeeSchema])
  public async createEmployee(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.employeeService.createEmployee(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createEmployee", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/')
  @Authenticate([UserCategory.ALL])
  @Validate([employeeQuerySchema])
  public async getEmployees(req: Request, res: Response): Promise<void> {
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
      console.log("Error in getEmployees", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([employeeIdSchema])
  public async getEmployeeById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.employeeService.getEmployeeById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getEmployeeById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([employeeIdSchema, updateEmployeeSchema])
  public async updateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.employeeService.updateEmployee(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updateEmployee", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([employeeIdSchema])
  public async deleteEmployee(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.employeeService.deleteEmployee(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deleteEmployee", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id/activate')
  @Validate([employeeIdSchema])
  public async activateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.employeeService.activateEmployee(id);
      result.send(res);
    } catch (error) {
      console.log("Error in activateEmployee", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id/deactivate')
  @Validate([employeeIdSchema])
  public async deactivateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.employeeService.deactivateEmployee(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deactivateEmployee", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id/performance')
  @Validate([employeeIdSchema])
  public async getEmployeePerformance(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.employeeService.getEmployeePerformance(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getEmployeePerformance", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}
