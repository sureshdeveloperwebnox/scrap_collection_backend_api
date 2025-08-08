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
const rules_1 = require("../rules");
const auth_1 = require("../services/auth");
let AuthController = class AuthController {
    signIn(req) {
        return this.getInstance().signIn(req.body);
    }
    signUp(req) {
        return this.getInstance().signUp(req.body);
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
exports.AuthController = AuthController = __decorate([
    (0, decorators_1.Controller)('/auth')
], AuthController);
