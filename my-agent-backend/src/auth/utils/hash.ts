import argon2 from 'argon2';
import { createHash } from 'node:crypto';

// argon2id — OWASP recommended. Không dùng bcrypt cho code mới.
const ARGON2_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 64 * 1024,  // 64 MB
  timeCost: 3,
  parallelism: 4,
};

export const hashPassword   = (plain: string) => argon2.hash(plain, ARGON2_OPTS);
export const verifyPassword = (hash: string, plain: string) => argon2.verify(hash, plain);

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
