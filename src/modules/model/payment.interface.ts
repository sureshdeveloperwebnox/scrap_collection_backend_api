import { PaymentStatus } from './enum';

export interface IPayment {
  id: number;
  organizationId: number;
  customerId: number;
  orderId: number;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
} 