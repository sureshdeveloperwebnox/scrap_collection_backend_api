export interface IVehicleName {
  id: string;
  name: string;
  vehicleTypeId: number;
  vehicleType?: {
    id: number;
    name: string;
    icon?: string;
  };
  scrapYardId?: string;
  scrapYard?: {
    id: string;
    yardName: string;
    address: string;
  };
  organizationId: number;
  isActive: boolean;
  vehicleNumber?: string;
  make?: string;
  model?: string;
  year?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateVehicleNameRequest {
  organizationId: number;
  name: string;
  vehicleTypeId: number;
  scrapYardId?: string;
  isActive?: boolean;
  vehicleNumber?: string;
  make?: string;
  model?: string;
  year?: number;
}

export interface IUpdateVehicleNameRequest {
  name?: string;
  vehicleTypeId?: number;
  scrapYardId?: string;
  isActive?: boolean;
  vehicleNumber?: string;
  make?: string;
  model?: string;
  year?: number;
}

export interface IVehicleNameQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  organizationId?: number;
  vehicleTypeId?: number;
  scrapYardId?: string;
  sortBy?: 'name' | 'isActive' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
