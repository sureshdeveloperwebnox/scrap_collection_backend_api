import { Request, Response } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { PaymentService } from '../services/payment';
import { 
  createPaymentSchema,
  updatePaymentSchema,
  paymentQuerySchema,
  paymentIdSchema,
  createRefundSchema
} from '../rules/payment.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/payments')
export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  @POST('/')
  @Validate([createPaymentSchema])
  public async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.paymentService.createPayment(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createPayment", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/')
  @Validate([paymentQuerySchema])
  public async getPayments(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.paymentService.getPayments(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getPayments", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([paymentIdSchema])
  public async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.paymentService.getPaymentById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getPaymentById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([paymentIdSchema, updatePaymentSchema])
  public async updatePayment(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.paymentService.updatePayment(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updatePayment", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @POST('/:id/refund')
  @Validate([paymentIdSchema, createRefundSchema])
  public async createRefund(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.paymentService.createRefund(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createRefund", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}
