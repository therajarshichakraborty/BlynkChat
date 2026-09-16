export class ApiResponse<T = unknown> {
  public readonly statusCode: number;
  public readonly data: T;
  public readonly message: string;
  public readonly success: boolean;

  constructor(statusCode: number, data: T, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static success<T>(
    data: T,
    message = "Success",
    statusCode = 200
  ): ApiResponse<T> {
    return new ApiResponse(statusCode, data, message);
  }

  static created<T>(data: T, message = "Created successfully"): ApiResponse<T> {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = "No Content"): ApiResponse<null> {
    return new ApiResponse(204, null, message);
  }
}

export default ApiResponse;
