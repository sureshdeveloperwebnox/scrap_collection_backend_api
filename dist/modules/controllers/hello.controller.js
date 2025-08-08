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
exports.HelloController = void 0;
const decorators_1 = require("../../decorators");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const authenticate_decorator_1 = require("../../decorators/authenticate.decorator");
const user_category_enum_1 = require("../../utils/user-category.enum");
const api_result_1 = require("../../utils/api-result");
const hello_rules_1 = require("../rules/hello.rules");
let HelloController = class HelloController {
    helloPublic(req) {
        const name = req.query.name || 'World';
        return api_result_1.ApiResult.success({
            message: `Hello ${name}! This is a public endpoint anyone can access.`
        });
    }
    helloAll(req) {
        var _a, _b;
        const name = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || req.query.name || 'Authenticated User';
        return api_result_1.ApiResult.success({
            message: `Hello ${name}! This endpoint is accessible to all authenticated users.`,
            userCategory: this.getCategoryName((_b = req.user) === null || _b === void 0 ? void 0 : _b.category)
        });
    }
    helloAdmin(req) {
        var _a, _b;
        return api_result_1.ApiResult.success({
            message: `Hello Admin ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.name}! This endpoint is only accessible to administrators.`,
            userCategory: this.getCategoryName((_b = req.user) === null || _b === void 0 ? void 0 : _b.category)
        });
    }
    helloStaffOrAdmin(req) {
        var _a, _b;
        return api_result_1.ApiResult.success({
            message: `Hello ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.name}! This endpoint is accessible to staff and administrators.`,
            userCategory: this.getCategoryName((_b = req.user) === null || _b === void 0 ? void 0 : _b.category)
        });
    }
    getCategoryName(category) {
        switch (category) {
            case user_category_enum_1.UserCategory.Admin:
                return 'Administrator';
            case user_category_enum_1.UserCategory.Staff:
                return 'Staff Member';
            case user_category_enum_1.UserCategory.Customer:
                return 'Customer';
            default:
                return 'Unknown';
        }
    }
};
exports.HelloController = HelloController;
__decorate([
    (0, decorators_1.GET)('/public'),
    (0, middleware_decorator_1.Validate)([hello_rules_1.helloQueryValidation]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", api_result_1.ApiResult)
], HelloController.prototype, "helloPublic", null);
__decorate([
    (0, decorators_1.GET)('/all'),
    (0, middleware_decorator_1.Validate)([hello_rules_1.helloQueryValidation]),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.ALL]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", api_result_1.ApiResult)
], HelloController.prototype, "helloAll", null);
__decorate([
    (0, decorators_1.GET)('/admin'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.Admin]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", api_result_1.ApiResult)
], HelloController.prototype, "helloAdmin", null);
__decorate([
    (0, decorators_1.GET)('/staff-or-admin'),
    (0, authenticate_decorator_1.Authenticate)([user_category_enum_1.UserCategory.Admin, user_category_enum_1.UserCategory.Staff]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", api_result_1.ApiResult)
], HelloController.prototype, "helloStaffOrAdmin", null);
exports.HelloController = HelloController = __decorate([
    (0, decorators_1.Controller)('/hello')
], HelloController);
