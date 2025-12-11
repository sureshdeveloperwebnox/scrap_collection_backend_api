import { VehicleTypeEnum, VehicleConditionEnum, LeadSourceEnum, LeadStatus } from './enum';

export interface ILead {
  id: string;
  fullName: string;
  phone: string;
  countryCode?: string;
  email?: string;
  vehicleType: VehicleTypeEnum;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleCondition: VehicleConditionEnum;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  leadSource: LeadSourceEnum;
  photos?: string[]; // Array of image URLs
  notes?: string;
  status: LeadStatus;
  organizationId: number;
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateLeadRequest {
  organizationId: number;
  fullName: string;
  phone: string;
  countryCode?: string;
  email?: string;
  vehicleType: VehicleTypeEnum;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleCondition: VehicleConditionEnum;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  leadSource: LeadSourceEnum;
  photos?: string[];
  notes?: string;
  customerId?: string;
}

export interface IUpdateLeadRequest {
  fullName?: string;
  phone?: string;
  countryCode?: string;
  email?: string;
  vehicleType?: VehicleTypeEnum;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleCondition?: VehicleConditionEnum;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  leadSource?: LeadSourceEnum;
  photos?: string[];
  notes?: string;
  status?: LeadStatus;
}

export interface ILeadQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  vehicleType?: VehicleTypeEnum;
  leadSource?: LeadSourceEnum;
  organizationId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'fullName' | 'phone' | 'email' | 'status' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  vehicleCondition?: VehicleConditionEnum;
}

export interface IConvertLeadToOrderRequest {
  leadId: string;
  quotedPrice?: number;
  pickupTime?: Date;
  assignedCollectorId?: string;
  yardId?: string;
  customerNotes?: string;
  adminNotes?: string;
}
