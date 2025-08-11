import { UserRole, AdminRoleType, ScrapCategory } from './enum';

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
  organizationId: string,
  firstName: string,
  lastName: string,
  contact: string,
  email: string,
  password: string,
  vehicleTypeId: number,
  scrapCategory: string,
  address?: string,
  status?: string,
}

export interface IUpdateCustomerRequest {
  id: string,
  organizationId: string,
  contact?: string;
  email?: string;
  vehicleTypeId?: number;
  scrapCategory?: string;
  address?: string;
  status?: string;
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


