import { Express, Router } from 'express';
import { attachControllers } from './api.routes';
import {
  AuthController,
  CountryController,
  CustomerController,
  HelloController,
  LeadController,
  VehicleTypeController,
  VehicleNameController,
  CollectorController,
  CollectorAssignmentController,
  EmployeeController,
  OrderController,
  PickupRequestController,
  PaymentController,
  ReviewController,
  ScrapYardController,
  ScrapCategoryController,
  ScrapNameController,
  UploadController,
  CityController,
  RoleController,
  CrewController,
  MobileAuthController,
  MobileWorkOrderController,
  MobileScrapCollectionController,
  ScrapCollectionRecordController,
  OrganizationController
} from '../modules/controllers';
import { InvoiceController } from '../modules/controllers/invoice.controller';
import { createRoleMiddleware, ValidatorMiddleware } from '../middlewares';
import assignmentRoutes from '../modules/routes/assignment.routes';

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
      VehicleTypeController,
      VehicleNameController,
      CollectorController,
      CollectorAssignmentController,
      EmployeeController,
      OrderController,
      PickupRequestController,
      PaymentController,
      ReviewController,
      ScrapYardController,
      ScrapCategoryController,
      ScrapNameController,
      UploadController,
      CityController,
      RoleController,
      CrewController,
      MobileAuthController,
      MobileWorkOrderController,
      MobileScrapCollectionController,
      ScrapCollectionRecordController,
      OrganizationController,
      InvoiceController
    ],
    {
      middleware: {
        auth: createRoleMiddleware,
        validator: ValidatorMiddleware,
      },
    }
  );

  // Register assignment routes
  apiRouter.use('/assignments', assignmentRoutes);

  app.use('/api/v1', apiRouter);
};