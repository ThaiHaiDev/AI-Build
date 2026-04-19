import type { RequestHandler } from 'express';
import { AppError } from '../../shared/errors.js';

interface Bucket { count: number; resetAt: number }
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60 * 1000;
const MAX = 20;

export const projectWriteLimiter: RequestHandler = (req, _res, next) => {
  const key = `${req.ip ?? 'unknown'}:${req.user?.id ?? 'anon'}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  b.count += 1;
  if (b.count > MAX) {
    return next(new AppError(429, 'Too many requests. Try again in a minute.', 'RATE_LIMIT'));
  }
  next();
};
