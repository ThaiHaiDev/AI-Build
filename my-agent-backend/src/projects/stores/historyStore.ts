import { Op } from 'sequelize';
import { History, type HistoryResourceType, type HistoryMeta } from '../../database/models/History.js';
import { logger } from '../../lib/logger.js';

export interface AppendInput {
  actorId:      string | null;
  actorName:    string;
  actorEmail:   string;
  action:       string;
  resourceType: HistoryResourceType;
  resourceId:   string;
  resourceName: string;
  projectId?:   string | null;
  projectName?: string | null;
  meta?:        HistoryMeta | null;
}

export interface HistoryEntry {
  id:           string;
  actorId:      string | null;
  actorName:    string;
  actorEmail:   string;
  action:       string;
  resourceType: HistoryResourceType;
  resourceId:   string;
  resourceName: string;
  projectId:    string | null;
  projectName:  string | null;
  meta:         HistoryMeta | null;
  createdAt:    Date;
}

export interface ListOpts {
  resourceType?: HistoryResourceType;
  action?:       string;
  actorId?:      string;
  projectId?:    string;
  from?:         Date;
  to?:           Date;
  page?:         number;
  limit?:        number;
}

export interface HistoryPage {
  entries: HistoryEntry[];
  total:   number;
  page:    number;
  limit:   number;
}

function toEntry(row: History): HistoryEntry {
  return {
    id:           row.id,
    actorId:      row.actorId ?? null,
    actorName:    row.actorName,
    actorEmail:   row.actorEmail,
    action:       row.action,
    resourceType: row.resourceType,
    resourceId:   row.resourceId,
    resourceName: row.resourceName,
    projectId:    row.projectId ?? null,
    projectName:  row.projectName ?? null,
    meta:         (row.meta as HistoryMeta | null) ?? null,
    createdAt:    row.createdAt,
  };
}

export const historyStore = {
  append(input: AppendInput): void {
    History.create({
      actorId:      input.actorId,
      actorName:    input.actorName,
      actorEmail:   input.actorEmail,
      action:       input.action,
      resourceType: input.resourceType,
      resourceId:   input.resourceId,
      resourceName: input.resourceName,
      projectId:    input.projectId ?? null,
      projectName:  input.projectName ?? null,
      meta:         input.meta ?? null,
    }).catch((err: unknown) => {
      logger.error({ err }, 'historyStore.append failed');
    });
  },

  async listByProject(projectId: string, opts: ListOpts = {}): Promise<HistoryPage> {
    const page  = Math.max(1, opts.page  ?? 1);
    const limit = Math.min(100, opts.limit ?? 20);

    const where: Record<string, unknown> = { projectId };
    if (opts.resourceType) where.resourceType = opts.resourceType;
    if (opts.action)       where.action       = opts.action;
    if (opts.from || opts.to) {
      where.createdAt = {
        ...(opts.from ? { [Op.gte]: opts.from } : {}),
        ...(opts.to   ? { [Op.lte]: opts.to }   : {}),
      };
    }

    const { rows, count } = await History.findAndCountAll({
      where,
      order:  [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { entries: rows.map(toEntry), total: count, page, limit };
  },

  async listGlobal(opts: ListOpts = {}): Promise<HistoryPage> {
    const page  = Math.max(1, opts.page  ?? 1);
    const limit = Math.min(100, opts.limit ?? 20);

    const where: Record<string, unknown> = {};
    if (opts.resourceType) where.resourceType = opts.resourceType;
    if (opts.action)       where.action       = opts.action;
    if (opts.actorId)      where.actorId      = opts.actorId;
    if (opts.projectId)    where.projectId    = opts.projectId;
    if (opts.from || opts.to) {
      where.createdAt = {
        ...(opts.from ? { [Op.gte]: opts.from } : {}),
        ...(opts.to   ? { [Op.lte]: opts.to }   : {}),
      };
    }

    const { rows, count } = await History.findAndCountAll({
      where,
      order:  [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { entries: rows.map(toEntry), total: count, page, limit };
  },
};
