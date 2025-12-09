import { RequestX } from '../../utils/request.interface';
import { Controller, POST, Validate } from '../../decorators';
import { forSignIn, forSignUp, forGoogleSignIn } from '../rules';
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

  @POST('/google')
  @Validate([forGoogleSignIn])
  public signInWithGoogle(req: RequestX): Promise<ApiResult> {
    return this.getInstance().signInWithGoogle(req.body.idToken);
  }

  @POST('/signout')
  public signOut(req: RequestX): Promise<ApiResult> {
    return this.getInstance().signOut();
  }

  private getInstance(): Auth {
    if (!this.auth) this.auth = new Auth();
    return this.auth;
  }
}