import { Request, Response } from 'express';
import { RequestX } from "../../utils/request.interface";

import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { RoleService } from '../services/role';
import {
  createRoleSchema,
  updateRoleSchema,
  roleQuerySchema,
  roleIdSchema
} from '../rules/role.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/roles')
export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  @GET('/stats')
  public async getRoleStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.roleService.getRoleStats();
      result.send(res);
    } catch (error) {
      console.log("Error in getRoleStats", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @POST('/')
  @Validate([createRoleSchema])
  public async createRole(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.roleService.createRole(req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in createRole", error);
      ApiResult.error("Error in createRole", 500).send(res);
    }
  }

  @GET('/')
  @Validate([roleQuerySchema])
  public async getRoles(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.roleService.getRoles(req.query);
      result.send(res);
    } catch (error) {
      console.log("Error in getRoles", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @GET('/:id')
  @Validate([roleIdSchema])
  public async getRoleById(req: RequestX, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.roleService.getRoleById(id);
      result.send(res);
    } catch (error) {
      console.log("Error in getRoleById", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id')
  @Validate([roleIdSchema, updateRoleSchema])
  public async updateRole(req: RequestX, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.roleService.updateRole(id, req.body);
      result.send(res);
    } catch (error) {
      console.log("Error in updateRole", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/:id')
  @Validate([roleIdSchema])
  public async deleteRole(req: RequestX, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.roleService.deleteRole(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deleteRole", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id/activate')
  @Validate([roleIdSchema])
  public async activateRole(req: RequestX, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.roleService.activateRole(id);
      result.send(res);
    } catch (error) {
      console.log("Error in activateRole", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @PUT('/:id/deactivate')
  @Validate([roleIdSchema])
  public async deactivateRole(req: RequestX, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.roleService.deactivateRole(id);
      result.send(res);
    } catch (error) {
      console.log("Error in deactivateRole", error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}
