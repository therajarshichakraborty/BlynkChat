import "server-only";

export type ServiceErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "RATE_LIMITED";

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;
  readonly fields?: Record<string, string>;

  constructor(code: ServiceErrorCode, message: string, fields?: Record<string, string>) {
    super(message);
    this.code = code;
    this.fields = fields;
  }
}

export function notFound(message = "We could not find that.") {
  return new ServiceError("NOT_FOUND", message);
}

export function forbidden(message = "You do not have permission to do that.") {
  return new ServiceError("FORBIDDEN", message);
}

export function invalid(message: string, fields?: Record<string, string>) {
  return new ServiceError("VALIDATION", message, fields);
}
