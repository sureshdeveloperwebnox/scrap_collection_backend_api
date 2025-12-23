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
exports.MobileAuthController = void 0;
const decorators_1 = require("../../decorators");
const mobile_auth_rules_1 = require("../rules/mobile-auth.rules");
const mobile_auth_1 = require("../services/mobile-auth");
let MobileAuthController = class MobileAuthController {
    /**
     * POST /mobile/auth/login
     * Mobile login endpoint for collectors
     * Accepts email or phone number with password
     */
    login(req) {
        return this.getInstance().mobileLogin(req.body);
    }
    /**
     * POST /mobile/auth/refresh
     * Refresh access token using refresh token
     */
    refresh(req) {
        return this.getInstance().refreshAccessToken(req.body);
    }
    /**
     * POST /mobile/auth/logout
     * Logout endpoint (client-side token removal)
     */
    logout(req) {
        return this.getInstance().mobileLogout();
    }
    getInstance() {
        if (!this.mobileAuth)
            this.mobileAuth = new mobile_auth_1.MobileAuth();
        return this.mobileAuth;
    }
};
exports.MobileAuthController = MobileAuthController;
__decorate([
    (0, decorators_1.POST)('/login'),
    (0, decorators_1.Validate)([mobile_auth_rules_1.forMobileLogin]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MobileAuthController.prototype, "login", null);
__decorate([
    (0, decorators_1.POST)('/refresh'),
    (0, decorators_1.Validate)([mobile_auth_rules_1.forRefreshToken]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MobileAuthController.prototype, "refresh", null);
__decorate([
    (0, decorators_1.POST)('/logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MobileAuthController.prototype, "logout", null);
exports.MobileAuthController = MobileAuthController = __decorate([
    (0, decorators_1.Controller)('/mobile/auth')
], MobileAuthController);
