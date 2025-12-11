import { CustomerStatus } from './enum';

export interface ICustomer {
  id: string;
  name: string;
  phone: string;
  countryCode?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  accountStatus: CustomerStatus;
  joinedDate: Date;
  organizationId: number;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCustomerRequest {
  organizationId: number;
  name: string;
  phone: string;
  countryCode?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  userId?: string;
}

export interface IUpdateCustomerRequest {
  name?: string;
  phone?: string;
  countryCode?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  accountStatus?: CustomerStatus;
}

export interface ICustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  accountStatus?: CustomerStatus;
  organizationId?: number;
}

export interface ICustomerStats {
  total: number;
  active: number;
  blocked: number;
}
