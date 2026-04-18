import type { Response, CookieOptions } from 'express';
import { config } from '../../config/index.js';
import { REFRESH_COOKIE_NAME } from '../constants.js';

const baseCookieOpts = (): CookieOptions => ({
  httpOnly: true,
  secure: config.COOKIE_SECURE,
  sameSite: 'strict',
  domain: config.COOKIE_DOMAIN,
  path: '/api/auth',
});

export const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseCookieOpts(),
    maxAge: config.JWT_REFRESH_TTL * 1000,
  });
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOpts());
};
