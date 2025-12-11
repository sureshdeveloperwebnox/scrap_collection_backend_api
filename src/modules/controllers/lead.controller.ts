import { Request, Response } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { LeadService } from '../services/lead';
import { 
  createLeadSchema,
  updateLeadSchema,
  leadQuerySchema,
  leadIdSchema,
  convertLeadSchema
} from '../rules/lead.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/leads')
export class LeadController {
  private leadService: LeadService;

  constructor() {
    this.leadService = new LeadService();
  }

  @POST('/')
  @Validate([createLeadSchema])
  public async createLead(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.leadService.createLead(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createLead", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/')
  @Validate([leadQuerySchema])
  public async getLeads(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.leadService.getLeads(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getLeads", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([leadIdSchema])
  public async getLeadById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.leadService.getLeadById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getLeadById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([leadIdSchema, updateLeadSchema])
  public async updateLead(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.leadService.updateLead(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updateLead", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([leadIdSchema])
  public async deleteLead(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.leadService.deleteLead(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deleteLead", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id/convert')
  @Validate([leadIdSchema, convertLeadSchema])
  public async convertLead(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.leadService.convertLeadToOrder(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in convertLead", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id/timeline')
  @Validate([leadIdSchema])
  public async getLeadTimeline(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.leadService.getLeadTimeline(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getLeadTimeline", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/stats/:organizationId')
  public async getLeadStats(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = parseInt(req.params.organizationId);
      const result = await this.leadService.getLeadStats(organizationId);
      result.send(res);
    } catch (error) {
      console.log("Error in getLeadStats", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
} 