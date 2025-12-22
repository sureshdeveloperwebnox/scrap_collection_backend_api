import { OrderStatus, PaymentStatusEnum } from './enum';

export interface IOrder {
  id: string;
  orderNumber?: string; // Format: WO-DDMMYYYY-N
  leadId?: string;
  customerName: string;
  customerPhone: string;
  customerCountryCode?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  vehicleDetails: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
  };
  assignedCollectorId?: string;
  pickupTime?: Date;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatusEnum;
  quotedPrice?: number;
  actualPrice?: number;
  yardId?: string;
  crewId?: string;
  routeDistance?: string;
  routeDuration?: string;
  customerNotes?: string;
  adminNotes?: string;
  organizationId: number;
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrderRequest {
  organizationId: number;
  leadId?: string;
  customerName: string;
  customerPhone: string;
  customerCountryCode?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  vehicleDetails: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
  };
  assignedCollectorId?: string;
  pickupTime?: Date;
  quotedPrice?: number;
  yardId?: string;
  crewId?: string;
  routeDistance?: string;
  routeDuration?: string;
  customerNotes?: string;
  adminNotes?: string;
  customerId?: string;
}

export interface IUpdateOrderRequest {
  customerName?: string;
  customerPhone?: string;
  customerCountryCode?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
  };
  assignedCollectorId?: string;
  pickupTime?: Date;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatusEnum;
  quotedPrice?: number;
  actualPrice?: number;
  yardId?: string;
  crewId?: string;
  routeDistance?: string;
  routeDuration?: string;
  customerNotes?: string;
  adminNotes?: string;
}

export interface IAssignOrderRequest {
  orderId: string;
  collectorId: string;
}

export interface IOrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatusEnum;
  collectorId?: string;
  organizationId?: number;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
}

export interface IOrderTimeline {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  performedBy?: string;
  createdAt: Date;
}
