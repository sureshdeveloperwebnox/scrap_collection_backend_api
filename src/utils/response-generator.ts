// Define interfaces for the API response
export interface ApiResponse<T = any> {
  version: string;
  validationErrors: object[];
  code: number;
  status: 'success' | 'error';
  message: string;
  data: T | null;
}

// Default messages for common status codes
const defaultMessages: Record<number, string> = {
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
export class ResponseGenerator {
  static generate<T>(
    code: number,
    data: T | null = null,
    customMessage?: string,
    validationErrors: object[] = []
  ): ApiResponse<T> {
    const status: 'success' | 'error' = code >= 400 ? 'error' : 'success';
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
  static success<T>(data: T, code: number = 200, message?: string): ApiResponse<T> {
    return this.generate(code, data, message);
  }
  
  static error(message: string, code: number = 400, validationErrors: object[] = []): ApiResponse<null> {
    return this.generate(code, null, message, validationErrors);
  }
  
  // Send response to client
  static send(res: any, response: ApiResponse<any>): void {
    console.log('ResponseGenerator.send called with response:', response);
    res.status(response.code).json(response);
  }
}