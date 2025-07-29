import { ResponseGenerator, ApiResponse } from './response-generator';

export class ApiResult {
  private apiResponse: ApiResponse;

  constructor(apiResponse: ApiResponse) {
    this.apiResponse = apiResponse;
  }

  public static success(data: any, message = 'Success', statusCode = 200): ApiResult {
    console.log('APIresult data', data);
    
    const response = ResponseGenerator.generate(statusCode, data, message);
    return new ApiResult(response);
  }

  public static error(message = 'Error', statusCode = 400, data = null, validationErrors: object[] = []): ApiResult {
    const response = ResponseGenerator.generate(statusCode, data, message, validationErrors);
    return new ApiResult(response);
  }

  public send(res: any): void {
    ResponseGenerator.send(res, this.apiResponse);
  }
}