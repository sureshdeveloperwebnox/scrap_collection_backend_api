import { ScrapCategory, LeadStatus } from './enum';

export interface ILead {
  id: number;
  organizationId: number;
  customerId: number;
  name: string;
  contact: string;
  email?: string;
  location?: string;
  vehicleTypeId: number;
  scrapCategory: ScrapCategory;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateLeadRequest {
  organizationId: number;
  customerId: number;
  name: string;
  contact: string;
  email?: string;
  location?: string;
  vehicleTypeId: number;
  scrapCategory: ScrapCategory;
}

export interface IUpdateLeadRequest {
  name?: string;
  contact?: string;
  email?: string;
  location?: string;
  vehicleTypeId?: number;
  scrapCategory?: ScrapCategory;
  status?: LeadStatus;
}

export interface ILeadQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  scrapCategory?: ScrapCategory;
  organizationId?: number;
  customerId?: number;
} 