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
exports.UploadController = void 0;
const controller_decorator_1 = require("../../decorators/controller.decorator");
const method_decorator_1 = require("../../decorators/method.decorator");
const middleware_decorator_1 = require("../../decorators/middleware.decorator");
const upload_service_1 = require("../services/upload.service");
const api_result_1 = require("../../utils/api-result");
const upload_middleware_1 = require("../../middlewares/upload.middleware");
let UploadController = class UploadController {
    constructor() {
        this.uploadService = new upload_service_1.UploadService();
    }
    async getUploadConfig(req, res) {
        try {
            const result = this.uploadService.getUploadConfig();
            result.send(res);
        }
        catch (error) {
            console.log('Error in getUploadConfig', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async uploadImages(req, res) {
        try {
            const files = req.files;
            // Default folder structure: lead/vehicles/images
            const folder = req.query.type || 'lead/vehicles/images';
            if (!files || files.length === 0) {
                api_result_1.ApiResult.error('No files provided', 400).send(res);
                return;
            }
            const result = await this.uploadService.uploadImages(files, folder);
            result.send(res);
        }
        catch (error) {
            console.log('Error in uploadImages', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteImage(req, res) {
        try {
            const { path, url } = req.body; // Support both 'path' and 'url' for backward compatibility
            const imagePath = path || url;
            if (!imagePath) {
                api_result_1.ApiResult.error('Image path is required', 400).send(res);
                return;
            }
            const result = await this.uploadService.deleteImage(imagePath);
            result.send(res);
        }
        catch (error) {
            console.log('Error in deleteImage', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
    async deleteImages(req, res) {
        try {
            const { paths, urls } = req.body; // Support both 'paths' and 'urls' for backward compatibility
            const imagePaths = paths || urls;
            if (!imagePaths || !Array.isArray(imagePaths)) {
                api_result_1.ApiResult.error('Image paths array is required', 400).send(res);
                return;
            }
            const result = await this.uploadService.deleteImages(imagePaths);
            result.send(res);
        }
        catch (error) {
            console.log('Error in deleteImages', error);
            api_result_1.ApiResult.error(error.message, 500).send(res);
        }
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, method_decorator_1.GET)('/config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getUploadConfig", null);
__decorate([
    (0, method_decorator_1.POST)('/images'),
    (0, middleware_decorator_1.Middleware)([
        (req, res, next) => {
            (0, upload_middleware_1.uploadImages)(req, res, (err) => {
                if (err) {
                    return api_result_1.ApiResult.error(err.message || 'File upload error', 400).send(res);
                }
                next();
            });
        }
    ]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImages", null);
__decorate([
    (0, method_decorator_1.DELETE)('/images'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "deleteImage", null);
__decorate([
    (0, method_decorator_1.DELETE)('/images/bulk'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "deleteImages", null);
exports.UploadController = UploadController = __decorate([
    (0, controller_decorator_1.Controller)('/upload'),
    __metadata("design:paramtypes", [])
], UploadController);
