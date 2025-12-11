import { PaymentStatusEnum, PaymentTypeEnum } from './enum';

export interface IPayment {
  id: string;
  orderId: string;
  customerId: string;
  collectorId?: string;
  amount: number;
  paymentType: PaymentTypeEnum;
  receiptUrl?: string;
  status: PaymentStatusEnum;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePaymentRequest {
  orderId: string;
  customerId: string;
  collectorId?: string;
  amount: number;
  paymentType: PaymentTypeEnum;
  receiptUrl?: string;
}

export interface IUpdatePaymentRequest {
  amount?: number;
  paymentType?: PaymentTypeEnum;
  receiptUrl?: string;
  status?: PaymentStatusEnum;
}

export interface IPaymentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatusEnum;
  paymentType?: PaymentTypeEnum;
  customerId?: string;
  collectorId?: string;
  organizationId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface IRefund {
  id: string;
  paymentId: string;
  amount: number;
  reason?: string;
  processedByAdmin?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateRefundRequest {
  paymentId: string;
  amount: number;
  reason?: string;
  processedByAdmin: string;
}
