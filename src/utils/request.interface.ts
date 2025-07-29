import { Request } from 'express';

export interface RequestX extends Request {
  user?: any;
  validatedData?: any;
}