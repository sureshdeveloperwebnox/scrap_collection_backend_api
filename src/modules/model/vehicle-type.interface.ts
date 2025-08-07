export interface IVehicleType {
  id: number;
  organizationId: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateVehicleTypeRequest {
  organizationId: number;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface IUpdateVehicleTypeRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface IVehicleTypeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  organizationId?: number;
} 