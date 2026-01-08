"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const decorators_1 = require("../../decorators");
const authenticate_decorator_1 = require("../../decorators/authenticate.decorator");
const rules_1 = require("../rules");
const auth_1 = require("../services/auth");
const api_result_1 = require("../../utils/api-result");
const user_category_enum_1 = require("../../utils/user-category.enum");
let AuthController = class AuthController {
    setCookies(res, accessToken, refreshToken) {
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
    async signIn(req) {
        const result = await this.getInstance().signIn(req.body);
        if (result.success && result.data) {
            this.setCookies(req.res, result.data.accessToken, result.data.refreshToken);
            // Don't send tokens in response body, only user data
            return api_result_1.ApiResult.success({ user: result.data.user }, result.message);
        }
        return result;
    }
    async signUp(req) {
        const result = await this.getInstance().signUp(req.body);
        if (result.success && result.data) {
            this.setCookies(req.res, result.data.accessToken, result.data.refreshToken);
            // Don't send tokens in response body, only user data
            return api_result_1.ApiResult.success({ user: result.data.user }, result.message, result.statusCode);
        }
        return result;
    }
    async signInWithGoogle(req) {
        const result = await this.getInstance().signInWithGoogle(req.body.idToken);
        if (result.success && result.data) {
            this.setCookies(req.res, result.data.accessToken, result.data.refreshToken);
            // Don't send tokens in response body, only user data
            return api_result_1.ApiResult.success({ user: result.data.user }, result.message);
        }
        return result;
    }
    async refreshToken(req) {
        var _a;
        const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
        if (!refreshToken) {
            return api_result_1.ApiResult.error('No refresh token provided', 401);
        }
        const result = await this.getInstance().refreshToken(refreshToken);
        if (result.success && result.data) {
            this.setCookies(req.res, result.data.accessToken, result.data.refreshToken);
            return api_result_1.ApiResult.success(null, result.message);
        }
        return result;
    }
    async getMe(req) {
        var _a;
        // User ID comes from the auth middleware (decoded from token)
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return api_result_1.ApiResult.error('Unauthorized', 401);
        }
        return this.getInstance().getMe(userId);
    }
    async updateProfile(req) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return api_result_1.ApiResult.error('Unauthorized', 401);
        }
        return this.getInstance().updateProfile(userId, req.body);
    }
    signOut(req) {
        const isProduction = process.env.NODE_ENV === 'production';
        // Clear cookies with exact same options plus explicit expiry
        const cookieOptions = {
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
    getInstance() {
        if (!this.auth)
            this.auth = new auth_1.Auth();
        return this.auth;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, decorators_1.POST)('/signin'),
    (0, decorators_1.Validate)([rules_1.forSignIn]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, decorators_1.POST)('/signup'),
    (0, decorators_1.Validate)([rules_1.forSignUp]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, decorators_1.POST)('/google'),
    (0, decorators_1.Validate)([rules_1.forGoogleSignIn]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signInWithGoogle", null);
__decorate([
    (0, decorators_1.POST)('/refresh'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, decorators_1.POST)('/me'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, decorators_1.POST)('/profile'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    (0, decorators_1.Validate)([rules_1.forProfileUpdate]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, decorators_1.POST)('/signout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signOut", null);
exports.AuthController = AuthController = __decorate([
    (0, decorators_1.Controller)('/auth')
], AuthController);
