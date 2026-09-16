export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown[];
  public readonly success: boolean;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: unknown[] = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = "Bad Request", errors: unknown[] = []): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(
    message = "Unauthorized",
    errors: unknown[] = []
  ): ApiError {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = "Forbidden", errors: unknown[] = []): ApiError {
    return new ApiError(403, message, errors);
  }

  static notFound(
    message = "Resource not found",
    errors: unknown[] = []
  ): ApiError {
    return new ApiError(404, message, errors);
  }

  static conflict(message = "Conflict", errors: unknown[] = []): ApiError {
    return new ApiError(409, message, errors);
  }

  static unprocessableEntity(
    message = "Validation Error",
    errors: unknown[] = []
  ): ApiError {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(
    message = "Too Many Requests",
    errors: unknown[] = []
  ): ApiError {
    return new ApiError(429, message, errors);
  }

  static internal(
    message = "Internal Server Error",
    errors: unknown[] = []
  ): ApiError {
    return new ApiError(500, message, errors);
  }
}

export default ApiError;
