import { Request, Response, NextFunction } from 'express';
import { VALIDATE_METADATA } from '../decorators';
import { ResponseGenerator } from '../utils/response-generator';
import { RequestX } from '../utils/request.interface';

export const ValidatorMiddleware = (
  req: RequestX, 
  res: Response, 
  next: NextFunction,
  rules: any[] = []
) => {
  // If no rules provided or empty array, continue
  if (!rules || rules.length === 0) {
    return next();
  }

  // Take the first rule in the array
  const rule = rules[0];
  
  // Validate body if body rule exists
  if (rule.body) {
    const { error, value } = rule.body.validate(req.body, { abortEarly: false });
    
    if (error) {
      const validationErrors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return ResponseGenerator.send(res, 
        ResponseGenerator.error('Validation error', 400, validationErrors)
      );
    }
    
    req.body = value;
  }
  
  // Validate params if params rule exists
  if (rule.params) {
    const { error } = rule.params.validate(req.params, { abortEarly: false });
    
    if (error) {
      const validationErrors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return ResponseGenerator.send(res, 
        ResponseGenerator.error('Validation error', 400, validationErrors)
      );
    }
  }
  
  // Validate query if query rule exists
  if (rule.query) {
    const { error } = rule.query.validate(req.query, { abortEarly: false });
    
    if (error) {
      const validationErrors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return ResponseGenerator.send(res, 
        ResponseGenerator.error('Validation error', 400, validationErrors)
      );
    }
  }
  
  // Store validated data in the request object
  req.validatedData = {
    body: req.body,
    params: req.params,
    query: req.query
  };
  
  next();
};