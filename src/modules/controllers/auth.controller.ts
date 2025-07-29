import { RequestX } from '../../utils/request.interface';
import { Controller, POST, Validate } from '../../decorators';
import { forSignIn, forSignUp } from '../rules';
import { Auth } from '../services/auth';
import { ApiResult } from '../../utils/api-result';

@Controller('/auth')
export class AuthController {
  private auth!: Auth;

  @POST('/signin')
  @Validate([forSignIn])
  public signIn(req: RequestX): Promise<ApiResult> {
    return this.getInstance().signIn(req.body);
  }

  @POST('/signup')
  @Validate([forSignUp])
  public signUp(req: RequestX): Promise<ApiResult> {
    return this.getInstance().signUp(req.body);
  }

  private getInstance(): Auth {
    if (!this.auth) this.auth = new Auth();
    return this.auth;
  }
}