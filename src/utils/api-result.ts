import { ResponseGenerator, ApiResponse } from './response-generator';

export class ApiResult {
  private apiResponse: ApiResponse;

  constructor(apiResponse: ApiResponse) {
    this.apiResponse = apiResponse;
  }

  public static success(data: any, message = 'Success', statusCode = 200): ApiResult {
    console.log('APIresult data', data);
    
    const response = ResponseGenerator.generate(statusCode, data, message);
    console.log('Generated response:', response);
    return new ApiResult(response);
  }

  public static error(message = 'Error', statusCode = 400, data = null, validationErrors: object[] = []): ApiResult {
    const response = ResponseGenerator.generate(statusCode, data, message, validationErrors);
    return new ApiResult(response);
  }

  public send(res: any): void {
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
    ResponseGenerator.send(res, this.apiResponse);
  }
}