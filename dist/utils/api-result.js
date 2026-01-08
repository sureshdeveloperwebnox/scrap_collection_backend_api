"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResult = void 0;
const response_generator_1 = require("./response-generator");
class ApiResult {
    constructor(apiResponse) {
        this.apiResponse = apiResponse;
    }
    static success(data, message = 'Success', statusCode = 200) {
        console.log('APIresult data', data);
        const response = response_generator_1.ResponseGenerator.generate(statusCode, data, message);
        console.log('Generated response:', response);
        return new ApiResult(response);
    }
    static error(message = 'Error', statusCode = 400, data = null, validationErrors = []) {
        const response = response_generator_1.ResponseGenerator.generate(statusCode, data, message, validationErrors);
        return new ApiResult(response);
    }
    // Getter methods for accessing response properties
    get success() {
        return this.apiResponse.status === 'success';
    }
    get data() {
        return this.apiResponse.data;
    }
    get message() {
        return this.apiResponse.message;
    }
    get statusCode() {
        return this.apiResponse.code;
    }
    send(res) {
        console.log('ApiResult.send called with apiResponse:', this.apiResponse);
        if (!this.apiResponse) {
            console.error('apiResponse is undefined!');
            res.status(500).json({
                success: false,
                message: 'Internal server error - ApiResult not properly initialized',
                data: null
            });
            return;
        }
        response_generator_1.ResponseGenerator.send(res, this.apiResponse);
    }
}
exports.ApiResult = ApiResult;
