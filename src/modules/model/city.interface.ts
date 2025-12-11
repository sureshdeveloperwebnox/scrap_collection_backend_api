export interface ICity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCityRequest {
  name: string;
  latitude: number;
  longitude: number;
  isActive?: boolean;
}

export interface IUpdateCityRequest {
  name?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}

export interface ICityQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'isActive' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

