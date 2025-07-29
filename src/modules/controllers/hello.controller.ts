// src/controllers/hello.controller.ts
import { RequestX } from '../../utils/request.interface';
import { Controller, GET } from '../../decorators';
import { Validate } from '../../decorators/middleware.decorator';
import { Authenticate } from '../../decorators/authenticate.decorator';
import { UserCategory } from '../../utils/user-category.enum';
import { ApiResult } from '../../utils/api-result';
import { helloQueryValidation } from '../rules/hello.rules';

@Controller('/hello')
export class HelloController {
  @GET('/public')
  @Validate([helloQueryValidation])
  public helloPublic(req: RequestX): ApiResult {
    const name = req.query.name || 'World';
    return ApiResult.success({
      message: `Hello ${name}! This is a public endpoint anyone can access.`
    });
  }

  @GET('/all')
  @Validate([helloQueryValidation])
  @Authenticate([UserCategory.ALL])
  public helloAll(req: RequestX): ApiResult {
    const name = req.user?.name || req.query.name || 'Authenticated User';
    return ApiResult.success({
      message: `Hello ${name}! This endpoint is accessible to all authenticated users.`,
      userCategory: this.getCategoryName(req.user?.category)
    });
  }

  @GET('/admin')
  @Authenticate([UserCategory.Admin])
  public helloAdmin(req: RequestX): ApiResult {
    return ApiResult.success({
      message: `Hello Admin ${req.user?.name}! This endpoint is only accessible to administrators.`,
      userCategory: this.getCategoryName(req.user?.category)
    });
  }

  @GET('/staff-or-admin')
  @Authenticate([UserCategory.Admin, UserCategory.Staff])
  public helloStaffOrAdmin(req: RequestX): ApiResult {
    return ApiResult.success({
      message: `Hello ${req.user?.name}! This endpoint is accessible to staff and administrators.`,
      userCategory: this.getCategoryName(req.user?.category)
    });
  }

  private getCategoryName(category?: UserCategory): string {
    switch(category) {
      case UserCategory.Admin:
        return 'Administrator';
      case UserCategory.Staff:
        return 'Staff Member';
      case UserCategory.Customer:
        return 'Customer';
      default:
        return 'Unknown';
    }
  }
}