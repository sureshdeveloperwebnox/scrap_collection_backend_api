import Joi from 'joi';
import { PaymentStatusEnum, PaymentTypeEnum } from '../model/enum';

export const createPaymentSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  customerId: Joi.string().uuid().required(),
  collectorId: Joi.string().uuid().optional(),
  amount: Joi.number().positive().required(),
  paymentType: Joi.string().valid(...Object.values(PaymentTypeEnum)).required(),
  receiptUrl: Joi.string().uri().optional()
});

export const updatePaymentSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  paymentType: Joi.string().valid(...Object.values(PaymentTypeEnum)).optional(),
  receiptUrl: Joi.string().uri().optional(),
  status: Joi.string().valid(...Object.values(PaymentStatusEnum)).optional()
});

export const paymentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  status: Joi.string().valid(...Object.values(PaymentStatusEnum)).optional(),
  paymentType: Joi.string().valid(...Object.values(PaymentTypeEnum)).optional(),
  customerId: Joi.string().uuid().optional(),
  collectorId: Joi.string().uuid().optional(),
  organizationId: Joi.number().integer().positive().optional(),
  dateFrom: Joi.string().isoDate().optional(),
  dateTo: Joi.string().isoDate().optional()
});

export const paymentIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});

export const createRefundSchema = Joi.object({
  amount: Joi.number().positive().required(),
  reason: Joi.string().optional(),
  processedByAdmin: Joi.string().required()
});
