import type { RequestHandler } from 'express';
import { AppError } from '../../shared/errors.js';

/**
 * ⚠️ Simple in-memory rate limiter cho scaffold.
 * Production → dùng redis + sliding window (xem `rate-limiter-flexible` hoặc Redis Lua).
 *
 * Giới hạn: 5 lần fail login / 15 phút cho cùng email. 20 lần / 15 phút cho cùng IP.
 */
interface Bucket { count: number; resetAt: number }
const emailBuckets = new Map<string, Bucket>();
const ipBuckets    = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const EMAIL_MAX = 5;
const IP_MAX    = 20;

const hit = (m: Map<string, Bucket>, key: string, max: number): boolean => {
  const now = Date.now();
  const b = m.get(key);
  if (!b || b.resetAt < now) {
    m.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  b.count += 1;
  return b.count <= max;
};

export const authRateLimiter: RequestHandler = (req, _res, next) => {
  const ip    = req.ip ?? 'unknown';
  const email = (req.body?.email as string | undefined)?.toLowerCase() ?? 'unknown';

  const okIp    = hit(ipBuckets,    ip,    IP_MAX);
  const okEmail = hit(emailBuckets, email, EMAIL_MAX);
  if (!okIp || !okEmail) {
    return next(new AppError(429, 'Too many login attempts. Try again later.', 'RATE_LIMIT'));
  }
  next();
};
