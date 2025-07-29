export interface ICountry {
  id: number;
  name: string;
  currency: string; 
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCountryRequest {
  name: string;
  currency: string;
  isActive?: boolean;
}

export interface IUpdateCountryRequest {
  name?: string;
  currency?: string;
  isActive?: boolean;
}

export interface ICountryQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
} 