import { Request, Response } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { CustomerService } from '../services/customer';
import { 
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
  customerIdSchema,
  customerUserIdSchema
} from '../rules/customer.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/customers')
export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  @POST('/')
  @Validate([createCustomerSchema])
  public async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.customerService.createCustomer(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createCustomer", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/')
  @Validate([customerQuerySchema])
  public async getCustomers(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.customerService.getCustomers(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getCustomers", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([customerIdSchema])
  public async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.customerService.getCustomerById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getCustomerById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/user/:userId')
  @Validate([customerUserIdSchema])
  public async getCustomerByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const result = await this.customerService.getCustomerByUserId(userId);
      result.send(res);
    } catch (error) {
      console.log("Error in getCustomerByUserId", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([customerIdSchema, updateCustomerSchema])
  public async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.customerService.updateCustomer(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updateCustomer", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([customerIdSchema])
  public async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.customerService.deleteCustomer(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deleteCustomer", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/stats/:organizationId')
  public async getCustomerStats(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = parseInt(req.params.organizationId);
      const result = await this.customerService.getCustomerStats(organizationId);
      result.send(res);
    } catch (error) {
      console.log("Error in getCustomerStats", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id/orders')
  @Validate([customerIdSchema])
  public async getCustomerOrders(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.customerService.getCustomerOrders(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getCustomerOrders", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id/payments')
  @Validate([customerIdSchema])
  public async getCustomerPayments(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.customerService.getCustomerPayments(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getCustomerPayments", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id/reviews')
  @Validate([customerIdSchema])
  public async getCustomerReviews(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.customerService.getCustomerReviews(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getCustomerReviews", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
} 