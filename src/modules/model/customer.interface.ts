import { UserRole, AdminRoleType } from './enum';

export interface ICustomer {
  id: number;
  organizationId: number;
  userId: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  organization?: {
    name: string;
  };
  user?: {
    id: string;
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    isActive: boolean;
  };
  orders?: any[];
  payments?: any[];
  reviews?: any[];
}

export interface ICreateCustomerRequest {
  organizationId: number;
  userId: string;
  address?: string;
}

export interface IUpdateCustomerRequest {
  address?: string;
}

export interface ICustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: number;
  isActive?: boolean;
}

export interface ICustomerStats {
  total: number;
  active: number;
  inactive: number;
  withOrders: number;
  withoutOrders: number;
}


