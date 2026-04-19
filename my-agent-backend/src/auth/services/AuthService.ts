import { userStore } from '../stores/userStore.js';
import { PasswordService } from './PasswordService.js';
import { TokenService } from './TokenService.js';
import { InvalidCredentialsError, EmailAlreadyExistsError } from '../errors.js';
import { ROLES } from '../constants.js';
import { toPublicUser, type PublicUser } from '../utils/toPublicUser.js';
import type { AuthUser, TokenPair } from '../types.js';

export const AuthService = {
  async register(input: { email: string; name: string; password: string }): Promise<{ user: PublicUser; tokens: TokenPair }> {
    const existing = await userStore.findByEmail(input.email);
    if (existing) throw new EmailAlreadyExistsError();

    const rec = await userStore.create({ ...input, role: ROLES.USER });
    const authUser: AuthUser = { id: rec.id, email: rec.email, role: rec.role };
    const tokens = await TokenService.issue(authUser);
    return { user: toPublicUser(rec), tokens };
  },

  async login(email: string, password: string): Promise<{ user: PublicUser; tokens: TokenPair }> {
    const rec = await userStore.findByEmail(email);
    // Chạy verify dù user không tồn tại để timing-constant (tránh lộ email)
    const ok = rec
      ? await PasswordService.verify(rec.passwordHash, password)
      : await PasswordService.verify(
          '$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          password,
        ).catch(() => false);

    if (!rec || !ok) throw new InvalidCredentialsError();

    const authUser: AuthUser = { id: rec.id, email: rec.email, role: rec.role };
    const tokens = await TokenService.issue(authUser);
    return { user: toPublicUser(rec), tokens };
  },

  async refresh(refreshToken: string): Promise<TokenPair> {
    return TokenService.rotate(refreshToken);
  },
};
