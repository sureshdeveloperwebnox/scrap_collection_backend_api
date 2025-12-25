export interface IOrganization {
  id: number;
  name: string;
  email?: string;
  website?: string;
  billingAddress?: string;
  latitude?: number;
  longitude?: number;
  countryId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrganization {
  name: string;
  email?: string;
  website?: string;
  billingAddress?: string;
  latitude?: number;
  longitude?: number;
  countryId?: number;
}

export interface IUpdateOrganization {
  name?: string;
  email?: string;
  website?: string;
  billingAddress?: string;
  latitude?: number;
  longitude?: number;
  countryId?: number;
}

