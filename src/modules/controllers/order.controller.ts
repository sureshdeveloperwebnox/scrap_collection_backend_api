import { Request, Response } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { OrderService } from '../services/order';
import {
  createOrderSchema,
  updateOrderSchema,
  orderQuerySchema,
  orderIdSchema,
  assignOrderSchema
} from '../rules/order.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/orders')
export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  @POST('/')
  @Validate([createOrderSchema])
  public async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.orderService.createOrder(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createOrder", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/stats')
  public async getOrderStats(req: Request, res: Response): Promise<void> {
    try {
      // Extract organizationId from user if available (assuming it might be attached to req.user)
      const organizationId = (req as any).user?.organizationId ? parseInt((req as any).user.organizationId) : undefined;
      const result = await this.orderService.getOrderStats(organizationId);
      result.send(res);
    } catch (error) {
      console.log("Error in getOrderStats", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/')
  @Validate([orderQuerySchema])
  public async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.orderService.getOrders(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getOrders", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([orderIdSchema])
  public async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.orderService.getOrderById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getOrderById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([orderIdSchema, updateOrderSchema])
  public async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.orderService.updateOrder(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updateOrder", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([orderIdSchema])
  public async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.orderService.deleteOrder(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deleteOrder", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @POST('/:id/assign')
  @Validate([orderIdSchema, assignOrderSchema])
  public async assignOrder(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.orderService.assignOrder(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in assignOrder", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id/timeline')
  @Validate([orderIdSchema])
  public async getOrderTimeline(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.orderService.getOrderTimeline(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getOrderTimeline", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}
