import { OrderStatus, PaymentStatusEnum } from './enum';

export interface IOrder {
  id: string;
  orderNumber?: string; // Format: WO-DDMMYYYY-N
  leadId?: string;
  customerName: string;

  customerEmail?: string;
  customerCountryCode?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  vehicleDetails: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    description?: string;
  };
  photos?: any; // JSON Array of image URLs
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
  instructions?: string;
  organizationId: number;
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrderRequest {
  organizationId: number;
  leadId?: string;
  customerName: string;

  customerEmail?: string;
  customerCountryCode?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  vehicleDetails: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    description?: string; // Optional field
  };
  photos?: any; // JSON Array of image URLs
  assignedCollectorId?: string;
  pickupTime: Date; // Required for new orders
  quotedPrice?: number;
  yardId?: string;
  crewId?: string;
  routeDistance?: string;
  routeDuration?: string;
  customerNotes?: string;
  adminNotes?: string;
  instructions?: string;
  customerId?: string;
}

export interface IUpdateOrderRequest {
  customerName?: string;

  customerCountryCode?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    description?: string;
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
  collectorId?: string;
  crewId?: string;
  yardId?: string;
  routeDistance?: string;
  routeDuration?: string;
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
  customerId?: string;
}

export interface IOrderTimeline {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  performedBy?: string;
  createdAt: Date;
}
