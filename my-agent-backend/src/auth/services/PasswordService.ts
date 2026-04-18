import { hashPassword, verifyPassword } from '../utils/hash.js';

export const PasswordService = {
  hash:   (plain: string) => hashPassword(plain),
  verify: (hash: string, plain: string) => verifyPassword(hash, plain),
};
