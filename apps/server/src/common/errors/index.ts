/**
 * Base application error class. All custom errors extend this.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Ensure the stack trace is captured properly
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request — invalid input from the client.
 */
export class ValidationError extends AppError {
  public readonly details?: Record<string, string[]>;

  constructor(message = "Validation failed", details?: Record<string, string[]>) {
    super(message, 400);
    this.details = details;
  }
}

/**
 * 401 Unauthorized — missing or invalid authentication credentials.
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden — authenticated but not permitted.
 */
export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403);
  }
}

/**
 * 404 Not Found — the requested resource does not exist.
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/**
 * 409 Conflict — the request conflicts with the current state.
 */
export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}

/**
 * 429 Too Many Requests — rate limit exceeded.
 */
export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429);
  }
}
