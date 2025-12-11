import Joi from 'joi';
import { PickupRequestStatus } from '../model/enum';

export const createPickupRequestSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  vehicleDetails: Joi.object({
    make: Joi.string().optional(),
    model: Joi.string().optional(),
    year: Joi.number().integer().optional(),
    condition: Joi.string().optional(),
    type: Joi.string().optional()
  }).required(),
  pickupAddress: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  organizationId: Joi.number().integer().positive().required()
});

export const updatePickupRequestSchema = Joi.object({
  vehicleDetails: Joi.object({
    make: Joi.string().optional(),
    model: Joi.string().optional(),
    year: Joi.number().integer().optional(),
    condition: Joi.string().optional(),
    type: Joi.string().optional()
  }).optional(),
  pickupAddress: Joi.string().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  status: Joi.string().valid(...Object.values(PickupRequestStatus)).optional(),
  assignedTo: Joi.string().uuid().optional()
});

export const pickupRequestQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  status: Joi.string().valid(...Object.values(PickupRequestStatus)).optional(),
  assignedTo: Joi.string().uuid().optional(),
  customerId: Joi.string().uuid().optional(),
  organizationId: Joi.number().integer().positive().optional()
});

export const pickupRequestIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});

export const assignPickupRequestSchema = Joi.object({
  collectorId: Joi.string().uuid().required()
});
