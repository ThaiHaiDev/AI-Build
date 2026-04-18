import type { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { config } from '../../config/index.js';
import { UnauthorizedError } from '../../shared/errors.js';
import { AuthService } from '../services/AuthService.js';
import { loginSchema, registerSchema } from '../schemas/login.schema.js';
import { setRefreshCookie, clearRefreshCookie } from '../utils/cookie.js';
import { revokedTokenStore } from '../stores/revokedTokenStore.js';
import { REFRESH_COOKIE_NAME } from '../constants.js';

export const AuthController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);
    const { user, tokens } = await AuthService.register(body);
    setRefreshCookie(res, tokens.refreshToken);
    res.status(201).json({ user, accessToken: tokens.accessToken });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);
    const { user, tokens } = await AuthService.login(email, password);
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ user, accessToken: tokens.accessToken });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!raw) throw new UnauthorizedError('Missing refresh token');
    const tokens = await AuthService.refresh(raw);
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ accessToken: tokens.accessToken });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    if (req.user) {
      await revokedTokenStore.revoke(req.user.jti, config.JWT_ACCESS_TTL);
    }
    clearRefreshCookie(res);
    res.json({ ok: true });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    res.json({ user: req.user });
  }),
};
