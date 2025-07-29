import { ScrapCategory, LeadStatus } from './enum';

export interface ILead {
  id: number;
  organizationId: number;
  customerId: number;
  name: string;
  contact: string;
  vehicleTypeId: number;
  scrapCategory: ScrapCategory;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
} 