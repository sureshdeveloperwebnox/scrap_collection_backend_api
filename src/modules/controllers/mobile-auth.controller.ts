import { RequestX } from '../../utils/request.interface';
import { Controller, POST, Validate } from '../../decorators';
import { forMobileLogin, forRefreshToken } from '../rules/mobile-auth.rules';
import { MobileAuth } from '../services/mobile-auth';
import { ApiResult } from '../../utils/api-result';

@Controller('/mobile/auth')
export class MobileAuthController {
    private mobileAuth!: MobileAuth;

    /**
     * POST /mobile/auth/login
     * Mobile login endpoint for collectors
     * Accepts email or phone number with password
     */
    @POST('/login')
    @Validate([forMobileLogin])
    public login(req: RequestX): Promise<ApiResult> {
        return this.getInstance().mobileLogin(req.body);
    }

    /**
     * POST /mobile/auth/refresh
     * Refresh access token using refresh token
     */
    @POST('/refresh')
    @Validate([forRefreshToken])
    public refresh(req: RequestX): Promise<ApiResult> {
        return this.getInstance().refreshAccessToken(req.body);
    }

    /**
     * POST /mobile/auth/logout
     * Logout endpoint (client-side token removal)
     */
    @POST('/logout')
    public logout(req: RequestX): Promise<ApiResult> {
        return this.getInstance().mobileLogout();
    }

    private getInstance(): MobileAuth {
        if (!this.mobileAuth) this.mobileAuth = new MobileAuth();
        return this.mobileAuth;
    }
}
