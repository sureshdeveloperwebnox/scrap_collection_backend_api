export interface IScrapYard {
  id: string;
  yardName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  assignedEmployeeIds?: string[];
  managerId?: string;
  operatingHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  isActive?: boolean;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateScrapYardRequest {
  organizationId: number;
  yardName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  assignedEmployeeIds?: string[];
  managerId?: string;
  operatingHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  isActive?: boolean;
}

export interface IUpdateScrapYardRequest {
  yardName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  assignedEmployeeIds?: string[];
  managerId?: string;
  operatingHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  isActive?: boolean;
}

export interface IScrapYardQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: number;
}
