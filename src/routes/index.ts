import { Express, Router } from 'express';
import { attachControllers } from './api.routes';
import { AuthController, CountryController, HelloController, LeadController } from '../modules/controllers';
import { createRoleMiddleware, ValidatorMiddleware } from '../middlewares';

export const combineRouters = (app: Express) => {
  const apiRouter = Router();
  
  attachControllers(
    apiRouter,
    [
      AuthController,
      HelloController,
      CountryController,
      LeadController
    ],
    {
      middleware: {
        auth: createRoleMiddleware,
        validator: ValidatorMiddleware,
      },
    }
  );
  
  app.use('/api/v1', apiRouter);
};