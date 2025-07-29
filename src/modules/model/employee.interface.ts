import { EmployeeRole } from './enum';

export interface IEmployee {
  id: number;
  organizationId: number;
  userId: string;
  role: EmployeeRole;
  workZone: string;
  createdAt: Date;
  updatedAt: Date;
  blocked: boolean;
  scrapYardId?: number;
} 