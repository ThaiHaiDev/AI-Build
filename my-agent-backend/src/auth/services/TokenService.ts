import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { config } from '../../config/index.js';
import { ROLES } from '../constants.js';
import { refreshTokenStore } from '../stores/refreshTokenStore.js';
import { sha256 } from '../utils/hash.js';
import { TokenReuseError } from '../errors.js';
import type { AuthUser, JwtPayload, TokenPair } from '../types.js';

const signAccess = (user: AuthUser, jti: string): string => {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: user.id,
    role: user.role,
    email: user.email,
    jti,
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role':  user.role,
      'x-hasura-allowed-roles': [user.role, ROLES.ANONYMOUS],
      'x-hasura-user-id':       user.id,
    },
  };
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_ACCESS_TTL,
    algorithm: 'HS256',
  });
};

export const TokenService = {
  async issue(user: AuthUser, family = randomBytes(16).toString('hex')): Promise<TokenPair> {
    const jti = randomBytes(16).toString('hex');
    const accessToken = signAccess(user, jti);

    const refreshRaw = randomBytes(48).toString('base64url');
    await refreshTokenStore.save(sha256(refreshRaw), {
      userId: user.id,
      email:  user.email,
      role:   user.role,
      family,
      expiresAt: Date.now() + config.JWT_REFRESH_TTL * 1000,
    });

    return { accessToken, refreshToken: refreshRaw };
  },

  verifyAccess(token: string): JwtPayload {
    return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
  },

  /** Rotate refresh token. Nếu reuse → revoke cả family (token theft detection). */
  async rotate(refreshRaw: string): Promise<TokenPair> {
    const hash = sha256(refreshRaw);
    const rec  = await refreshTokenStore.consume(hash);

    if (!rec) {
      // Token không tồn tại → có thể đã bị dùng. Thử revoke family nếu còn dấu vết.
      throw new TokenReuseError();
    }

    return this.issue(
      { id: rec.userId, email: rec.email, role: rec.role },
      rec.family,
    );
  },

  async revokeRefreshFamily(family: string): Promise<void> {
    await refreshTokenStore.revokeFamily(family);
  },
};
