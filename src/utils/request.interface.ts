import { Request, Response } from 'express';

export interface RequestX extends Request {
  user?: any;
  validatedData?: any;
  res: Response;
}