import type { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { EnvAccessForbiddenError, ForbiddenError, NotFoundError, UnauthorizedError } from '../../shared/errors.js';
import { testAccountStore } from '../stores/testAccountStore.js';
import { createTestAccountSchema, updateTestAccountSchema } from '../schemas/testAccount.schema.js';
import { ALL_ENVS, type Environment } from '../../database/models/ProjectMember.js';
import type { TestAccountRecord } from '../stores/testAccountStore.js';

function groupByEnv(
  accounts: TestAccountRecord[],
  allowedEnvs: string[],
): Partial<Record<Environment, TestAccountRecord[]>> {
  const grouped: Partial<Record<Environment, TestAccountRecord[]>> = {};
  for (const env of ALL_ENVS) {
    if (allowedEnvs.includes(env)) grouped[env] = [];
  }
  for (const a of accounts) {
    if (allowedEnvs.includes(a.environment)) {
      grouped[a.environment as Environment]!.push(a);
    }
  }
  return grouped;
}

function assertWriteAccess(req: Request) {
  if (req.memberRole !== 'admin') throw new ForbiddenError('Only project admins can modify test accounts');
}

function assertEnvAccess(req: Request, env: string) {
  if (!req.memberEnvs?.includes(env)) throw new EnvAccessForbiddenError(`No access to environment: ${env}`);
}

export const TestAccountController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const allowedEnvs = req.memberEnvs ?? [...ALL_ENVS];
    const accounts = await testAccountStore.findByProject(req.params.id!);
    res.json({ accounts: groupByEnv(accounts, allowedEnvs), grantedEnvs: allowedEnvs });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const account = await testAccountStore.findById(req.params.accountId!);
    if (!account || account.projectId !== req.params.id) throw new NotFoundError('Test account not found');
    assertEnvAccess(req, account.environment);
    res.json({ account });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    assertWriteAccess(req);
    const body = createTestAccountSchema.parse(req.body);
    assertEnvAccess(req, body.environment);
    const account = await testAccountStore.create({ projectId: req.params.id!, ...body }, req.user.id);
    res.status(201).json({ account });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    assertWriteAccess(req);
    const existing = await testAccountStore.findById(req.params.accountId!);
    if (!existing || existing.projectId !== req.params.id) throw new NotFoundError('Test account not found');
    assertEnvAccess(req, existing.environment);
    const body = updateTestAccountSchema.parse(req.body);
    if (body.environment) assertEnvAccess(req, body.environment);
    const account = await testAccountStore.update(req.params.accountId!, body);
    res.json({ account });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    assertWriteAccess(req);
    const existing = await testAccountStore.findById(req.params.accountId!);
    if (!existing || existing.projectId !== req.params.id) throw new NotFoundError('Test account not found');
    assertEnvAccess(req, existing.environment);
    await testAccountStore.remove(req.params.accountId!);
    res.status(204).send();
  }),
};
