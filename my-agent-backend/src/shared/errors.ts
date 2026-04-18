export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'APP_ERROR',
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class NotFoundError     extends AppError { constructor(m = 'Not found')      { super(404, m, 'NOT_FOUND'); } }
export class UnauthorizedError extends AppError { constructor(m = 'Unauthorized')   { super(401, m, 'UNAUTHORIZED'); } }
export class ForbiddenError    extends AppError { constructor(m = 'Forbidden')      { super(403, m, 'FORBIDDEN'); } }
export class ValidationError   extends AppError { constructor(m = 'Invalid input', d?: unknown) { super(400, m, 'VALIDATION', d); } }
export class ConflictError     extends AppError { constructor(m = 'Conflict')       { super(409, m, 'CONFLICT'); } }
