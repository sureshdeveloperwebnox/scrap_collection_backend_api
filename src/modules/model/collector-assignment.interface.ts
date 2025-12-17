export interface ICollectorAssignment {
  id: string;
  collectorId?: string;
  collector?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  crewId?: string;
  crew?: {
    id: string;
    name: string;
    description?: string;
  };
  vehicleNameId?: string;
  vehicleName?: {
    id: string;
    name: string;
    vehicleType?: {
      id: number;
      name: string;
    };
  };
  cityId?: number;
  city?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  };
  organizationId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCollectorAssignmentRequest {
  organizationId: number;
  collectorId?: string;
  crewId?: string;
  vehicleNameId?: string;
  cityId?: number;
  scrapYardId?: string;
  isActive?: boolean;
}

export interface IUpdateCollectorAssignmentRequest {
  vehicleNameId?: string | null;
  cityId?: number | null;
  scrapYardId?: string | null;
  isActive?: boolean;
}

export interface ICollectorAssignmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  organizationId?: number;
  collectorId?: string;
  vehicleNameId?: string;
  cityId?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
