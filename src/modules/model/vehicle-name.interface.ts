export interface IVehicleName {
  id: string;
  name: string;
  vehicleTypeId: number;
  vehicleType?: {
    id: number;
    name: string;
    icon?: string;
  };
  organizationId: number;
  make?: string;
  model?: string;
  year?: number;
  vehicleId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateVehicleNameRequest {
  organizationId: number;
  name?: string; // Optional - will be auto-generated from make and model if not provided
  vehicleTypeId: number;
  make?: string;
  model?: string;
  condition?: string;
  year?: number;
  vehicleId: string; // Required
  isActive?: boolean;
}

export interface IUpdateVehicleNameRequest {
  name?: string;
  vehicleTypeId?: number;
  make?: string;
  model?: string;
  year?: number;
  vehicleId?: string;
  isActive?: boolean;
}

export interface IVehicleNameQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  organizationId?: number;
  vehicleTypeId?: number;
  sortBy?: 'name' | 'isActive' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
