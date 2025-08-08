"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseGenerator = void 0;
// Default messages for common status codes
const defaultMessages = {
    100: 'Continue',
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    409: 'Conflict',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
};
/**
 * Generates a standardized API response
 */
class ResponseGenerator {
    static generate(code, data = null, customMessage, validationErrors = []) {
        const status = code >= 400 ? 'error' : 'success';
        const message = customMessage || defaultMessages[code] || 'Unknown status';
        return {
            version: '1.0.0',
            validationErrors,
            code,
            status,
            message,
            data
        };
    }
    // Helper methods to simplify common responses
    static success(data, code = 200, message) {
        return this.generate(code, data, message);
    }
    static error(message, code = 400, validationErrors = []) {
        return this.generate(code, null, message, validationErrors);
    }
    // Send response to client
    static send(res, response) {
        console.log('ResponseGenerator.send called with response:', response);
        res.status(response.code).json(response);
    }
}
exports.ResponseGenerator = ResponseGenerator;
