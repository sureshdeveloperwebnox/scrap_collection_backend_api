import { Request, Response } from 'express';

export interface RequestX extends Request {
  user?: any;
  validatedData?: any;
  collector?: {
    id: string;
    email: string;
    phone: string;
    fullName: string;
    role: string;
    roleId: number;
    organizationId: number;
    scrapYardId?: string;
    crewId?: string;
  };
  res: Response;
}