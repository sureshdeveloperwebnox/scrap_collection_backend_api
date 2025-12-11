import { PickupRequestStatus } from './enum';

export interface IPickupRequest {
  id: string;
  customerId: string;
  vehicleDetails: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    type?: string;
  };
  pickupAddress: string;
  latitude?: number;
  longitude?: number;
  status: PickupRequestStatus;
  assignedTo?: string;
  orderId?: string;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePickupRequestRequest {
  customerId: string;
  vehicleDetails: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    type?: string;
  };
  pickupAddress: string;
  latitude?: number;
  longitude?: number;
  organizationId: number;
}

export interface IUpdatePickupRequestRequest {
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    type?: string;
  };
  pickupAddress?: string;
  latitude?: number;
  longitude?: number;
  status?: PickupRequestStatus;
  assignedTo?: string;
}

export interface IAssignPickupRequestRequest {
  requestId: string;
  collectorId: string;
}

export interface IPickupRequestQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PickupRequestStatus;
  assignedTo?: string;
  customerId?: string;
  organizationId?: number;
}
