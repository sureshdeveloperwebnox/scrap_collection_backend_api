import { Express, Router } from 'express';
import { attachControllers } from './api.routes';
import { AuthController, CountryController, CustomerController, HelloController, LeadController, VehicleTypeController } from '../modules/controllers';
import { createRoleMiddleware, ValidatorMiddleware } from '../middlewares';

export const combineRouters = (app: Express) => {
  const apiRouter = Router();
  
  attachControllers(
    apiRouter,
    [
      AuthController,
      HelloController,
      CustomerController,
      CountryController,
      LeadController,
      VehicleTypeController
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