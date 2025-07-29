import { OrderStatus } from './enum';

export interface IOrder {
  id: number;
  organizationId: number;
  customerId: number;
  employeeId?: number;
  leadId?: number;
  vehicleTypeId: number;
  scrapYardId: number;
  pickupAddress: string;
  pickupDateTime: Date;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
} 