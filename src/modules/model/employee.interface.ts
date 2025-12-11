export interface IEmployee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode?: string;
  roleId: number;
  role?: {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
  };
  cityId?: number;
  city?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
  };
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
  roleId: number;
  cityId?: number;
  password: string;
}

export interface IUpdateEmployeeRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  roleId?: number;
  cityId?: number | null;
  password?: string;
  isActive?: boolean;
  deviceToken?: string;
}

export interface IEmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
  cityId?: number;
  isActive?: boolean;
  organizationId?: number;
}

export interface IEmployeePerformance {
  employeeId: string;
  totalPickups: number;
  averageRating: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}
