import type { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { UnauthorizedError, ValidationError } from '../../shared/errors.js';
import { userStore } from '../stores/userStore.js';
import { refreshTokenStore } from '../stores/refreshTokenStore.js';
import { PasswordService } from '../services/PasswordService.js';
import { hashPassword } from '../utils/hash.js';
import { toPublicUser } from '../utils/toPublicUser.js';
import { changePasswordSchema, updateNameSchema } from '../schemas/admin.schema.js';

export const MeController = {
  updateName: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const { name } = updateNameSchema.parse(req.body);
    const updated = await userStore.updateName(req.user.id, name);
    if (!updated) throw new UnauthorizedError('User no longer exists');
    res.json({ user: toPublicUser(updated) });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const rec = await userStore.findById(req.user.id);
    if (!rec) throw new UnauthorizedError('User no longer exists');

    const valid = await PasswordService.verify(rec.passwordHash, currentPassword);
    if (!valid) throw new ValidationError('Current password is incorrect');

    const newHash = await hashPassword(newPassword);
    await userStore.updatePasswordHash(req.user.id, newHash);
    // Revoke all refresh tokens — forces re-login on other devices
    await refreshTokenStore.revokeUser(req.user.id);
    res.json({ ok: true });
  }),
};
