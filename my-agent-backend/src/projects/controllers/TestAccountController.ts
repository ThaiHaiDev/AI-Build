import type { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../../shared/errors.js';
import { testAccountStore } from '../stores/testAccountStore.js';
import { createTestAccountSchema, updateTestAccountSchema } from '../schemas/testAccount.schema.js';
import type { Environment } from '../../database/models/TestAccount.js';
import type { TestAccountRecord } from '../stores/testAccountStore.js';

function groupByEnv(accounts: TestAccountRecord[]): Record<Environment, TestAccountRecord[]> {
  const grouped: Record<Environment, TestAccountRecord[]> = { dev: [], staging: [], production: [] };
  for (const a of accounts) grouped[a.environment].push(a);
  return grouped;
}

function assertWriteAccess(req: Request) {
  if (req.memberRole !== 'admin') throw new ForbiddenError('Only project admins can modify test accounts');
}

export const TestAccountController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const accounts = await testAccountStore.findByProject(req.params.id!);
    res.json({ accounts: groupByEnv(accounts) });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const account = await testAccountStore.findById(req.params.accountId!);
    if (!account || account.projectId !== req.params.id) throw new NotFoundError('Test account not found');
    res.json({ account });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    assertWriteAccess(req);
    const body = createTestAccountSchema.parse(req.body);
    const account = await testAccountStore.create({ projectId: req.params.id!, ...body }, req.user.id);
    res.status(201).json({ account });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    assertWriteAccess(req);
    const existing = await testAccountStore.findById(req.params.accountId!);
    if (!existing || existing.projectId !== req.params.id) throw new NotFoundError('Test account not found');
    const body = updateTestAccountSchema.parse(req.body);
    const account = await testAccountStore.update(req.params.accountId!, body);
    res.json({ account });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    assertWriteAccess(req);
    const existing = await testAccountStore.findById(req.params.accountId!);
    if (!existing || existing.projectId !== req.params.id) throw new NotFoundError('Test account not found');
    await testAccountStore.remove(req.params.accountId!);
    res.status(204).send();
  }),
};
