import { AppError } from '../shared/errors.js';

export class InvalidCredentialsError extends AppError {
  constructor() { super(401, 'Invalid email or password', 'INVALID_CREDENTIALS'); }
}

export class TokenReuseError extends AppError {
  constructor() { super(401, 'Refresh token reuse detected', 'TOKEN_REUSE'); }
}

export class EmailAlreadyExistsError extends AppError {
  constructor() { super(409, 'Email already registered', 'EMAIL_EXISTS'); }
}
