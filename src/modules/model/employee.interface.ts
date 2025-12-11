import { EmployeeRole } from './enum';

export interface IEmployee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode?: string;
  role: EmployeeRole;
  workZone?: string;
  passwordHash: string;
  isActive: boolean;
  profilePhoto?: string;
  rating?: number;
  completedPickups: number;
  deviceToken?: string;
  organizationId: number;
  userId?: string;
  scrapYardId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateEmployeeRequest {
  organizationId: number;
  fullName: string;
  email: string;
  phone: string;
  countryCode?: string;
  role: EmployeeRole;
  workZone?: string;
  password: string;
  profilePhoto?: string;
  scrapYardId?: string;
}

export interface IUpdateEmployeeRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  role?: EmployeeRole;
  workZone?: string;
  password?: string;
  isActive?: boolean;
  profilePhoto?: string;
  scrapYardId?: string;
  deviceToken?: string;
}

export interface IEmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: EmployeeRole;
  isActive?: boolean;
  organizationId?: number;
  workZone?: string;
}

export interface IEmployeePerformance {
  employeeId: string;
  totalPickups: number;
  averageRating: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}
