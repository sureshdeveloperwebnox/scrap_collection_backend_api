import Joi from 'joi';
import { OrderStatus, PaymentStatusEnum } from '../model/enum';
import { phoneCustomValidation } from '../../utils/phone-validator';

export const createOrderSchema = Joi.object({
  organizationId: Joi.number().integer().positive().required(),
  leadId: Joi.string().uuid().optional(),
  customerName: Joi.string().min(2).max(100).required(),
  customerPhone: Joi.string().custom(phoneCustomValidation, 'phone validation').required().messages({
    'any.required': 'Phone number is required',
    'any.custom': '{{#error.message}}'
  }),
  address: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  vehicleDetails: Joi.object({
    make: Joi.string().optional(),
    model: Joi.string().optional(),
    year: Joi.number().integer().optional(),
    condition: Joi.string().optional()
  }).required(),
  assignedCollectorId: Joi.string().uuid().optional(),
  pickupTime: Joi.date().optional(),
  quotedPrice: Joi.number().positive().optional(),
  yardId: Joi.string().uuid().optional(),
  customerNotes: Joi.string().optional(),
  adminNotes: Joi.string().optional(),
  customerId: Joi.string().uuid().optional()
});

export const updateOrderSchema = Joi.object({
  customerName: Joi.string().min(2).max(100).optional(),
  customerPhone: Joi.string().custom(phoneCustomValidation, 'phone validation').optional().messages({
    'any.custom': '{{#error.message}}'
  }),
  address: Joi.string().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  vehicleDetails: Joi.object({
    make: Joi.string().optional(),
    model: Joi.string().optional(),
    year: Joi.number().integer().optional(),
    condition: Joi.string().optional()
  }).optional(),
  assignedCollectorId: Joi.string().uuid().optional(),
  pickupTime: Joi.date().optional(),
  orderStatus: Joi.string().valid(...Object.values(OrderStatus)).optional(),
  paymentStatus: Joi.string().valid(...Object.values(PaymentStatusEnum)).optional(),
  quotedPrice: Joi.number().positive().optional(),
  actualPrice: Joi.number().positive().optional(),
  yardId: Joi.string().uuid().optional(),
  customerNotes: Joi.string().optional(),
  adminNotes: Joi.string().optional()
});

export const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  status: Joi.string().valid(...Object.values(OrderStatus)).optional(),
  paymentStatus: Joi.string().valid(...Object.values(PaymentStatusEnum)).optional(),
  collectorId: Joi.string().uuid().optional(),
  organizationId: Joi.number().integer().positive().optional(),
  dateFrom: Joi.string().isoDate().optional(),
  dateTo: Joi.string().isoDate().optional(),
  location: Joi.string().optional()
});

export const orderIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});

export const assignOrderSchema = Joi.object({
  collectorId: Joi.string().uuid().required()
});
