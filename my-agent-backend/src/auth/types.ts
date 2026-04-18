import type { Role } from './constants.js';

export interface JwtPayload {
  sub:   string;
  role:  Role;
  email: string;
  jti:   string;
  iat?:  number;
  exp?:  number;
  'https://hasura.io/jwt/claims': {
    'x-hasura-default-role':  Role;
    'x-hasura-allowed-roles': Role[];
    'x-hasura-user-id':       string;
  };
}

export interface TokenPair {
  accessToken:  string;
  refreshToken: string;
}

export interface AuthUser {
  id:    string;
  email: string;
  role:  Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser & { jti: string };
    }
  }
}
