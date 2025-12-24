import { RequestX } from '../../utils/request.interface';
import { Controller, POST, Validate } from '../../decorators';
import { Authenticate } from '../../decorators/authenticate.decorator';
import { forSignIn, forSignUp, forGoogleSignIn } from '../rules';
import { Auth } from '../services/auth';
import { ApiResult } from '../../utils/api-result';
import { Response } from 'express';
import { UserCategory } from '../../utils/user-category.enum';

@Controller('/auth')
export class AuthController {
  private auth!: Auth;

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    // Set httpOnly cookies for security
    const isProduction = process.env.NODE_ENV === 'production';

    // Access token cookie (15 minutes)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    // Refresh token cookie (7 days)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
  }

  @POST('/signin')
  @Validate([forSignIn])
  public async signIn(req: RequestX): Promise<ApiResult> {
    const result = await this.getInstance().signIn(req.body);

    if (result.success && result.data) {
      this.setCookies(req.res, result.data.accessToken, result.data.refreshToken);
      // Don't send tokens in response body, only user data
      return ApiResult.success({ user: result.data.user }, result.message);
    }

    return result;
  }

  @POST('/signup')
  @Validate([forSignUp])
  public async signUp(req: RequestX): Promise<ApiResult> {
    const result = await this.getInstance().signUp(req.body);

    if (result.success && result.data) {
      this.setCookies(req.res, result.data.accessToken, result.data.refreshToken);
      // Don't send tokens in response body, only user data
      return ApiResult.success({ user: result.data.user }, result.message, result.statusCode);
    }

    return result;
  }

  @POST('/google')
  @Validate([forGoogleSignIn])
  public async signInWithGoogle(req: RequestX): Promise<ApiResult> {
    const result = await this.getInstance().signInWithGoogle(req.body.idToken);

    if (result.success && result.data) {
      this.setCookies(req.res, result.data.accessToken, result.data.refreshToken);
      // Don't send tokens in response body, only user data
      return ApiResult.success({ user: result.data.user }, result.message);
    }

    return result;
  }

  @POST('/refresh')
  public async refreshToken(req: RequestX): Promise<ApiResult> {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return ApiResult.error('No refresh token provided', 401);
    }

    const result = await this.getInstance().refreshToken(refreshToken);

    if (result.success && result.data) {
      this.setCookies(req.res, result.data.accessToken, result.data.refreshToken);
      return ApiResult.success(null, result.message);
    }

    return result;
  }

  @POST('/me')
  @Authenticate([UserCategory.ALL])
  public async getMe(req: RequestX): Promise<ApiResult> {
    // User ID comes from the auth middleware (decoded from token)
    const userId = req.user?.id;

    if (!userId) {
      return ApiResult.error('Unauthorized', 401);
    }

    return this.getInstance().getMe(userId);
  }

  @POST('/signout')
  public signOut(req: RequestX): Promise<ApiResult> {
    const isProduction = process.env.NODE_ENV === 'production';

    // Clear cookies with exact same options plus explicit expiry
    const cookieOptions: any = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      expires: new Date(0) // 1970-01-01
    };

    req.res.cookie('accessToken', '', cookieOptions);
    req.res.cookie('refreshToken', '', cookieOptions);

    return this.getInstance().signOut();
  }

  private getInstance(): Auth {
    if (!this.auth) this.auth = new Auth();
    return this.auth;
  }
}