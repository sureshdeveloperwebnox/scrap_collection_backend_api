export interface IVehicleType {
  id: number;
  organizationId?: number;
  name: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateVehicleTypeRequest {
  organizationId?: number;
  name: string;
  icon?: string;
  isActive?: boolean;
}

export interface IUpdateVehicleTypeRequest {
  name?: string;
  icon?: string;
  isActive?: boolean;
}

export interface IVehicleTypeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  organizationId?: number;
  sortBy?: 'name' | 'isActive' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
} 