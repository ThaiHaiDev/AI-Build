import { Op, fn, col, where as sqlWhere } from 'sequelize';
import { Project, type ProjectStatus } from '../../database/models/Project.js';
import { ProjectMember } from '../../database/models/ProjectMember.js';
import { ROLES, type Role } from '../../auth/constants.js';

export interface ProjectRecord {
  id:                 string;
  name:               string;
  description:        string | null;
  techStack:          string | null;
  partnerName:        string | null;
  partnerContactName: string | null;
  partnerEmail:       string | null;
  partnerPhone:       string | null;
  status:             ProjectStatus;
  archivedAt:         Date | null;
  createdBy:          string;
  createdAt:          Date;
  updatedAt:          Date;
}

export interface CreateProjectInput {
  name:               string;
  description?:       string | null;
  techStack?:         string | null;
  partnerName?:       string | null;
  partnerContactName?:string | null;
  partnerEmail?:      string | null;
  partnerPhone?:      string | null;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

const toRecord = (p: Project): ProjectRecord => ({
  id:                 p.id,
  name:               p.name,
  description:        p.description ?? null,
  techStack:          p.techStack ?? null,
  partnerName:        p.partnerName ?? null,
  partnerContactName: p.partnerContactName ?? null,
  partnerEmail:       p.partnerEmail ?? null,
  partnerPhone:       p.partnerPhone ?? null,
  status:             p.status,
  archivedAt:         p.archivedAt ?? null,
  createdBy:          p.createdBy,
  createdAt:          p.createdAt,
  updatedAt:          p.updatedAt,
});

export const projectStore = {
  async findById(id: string): Promise<ProjectRecord | null> {
    const p = await Project.findByPk(id);
    return p ? toRecord(p) : null;
  },

  async findByNameCI(name: string, excludeId?: string): Promise<ProjectRecord | null> {
    const p = await Project.findOne({
      where: {
        ...sqlWhere(fn('LOWER', col('name')), name.toLowerCase()),
        ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
      },
    });
    return p ? toRecord(p) : null;
  },

  async create(input: CreateProjectInput, createdBy: string): Promise<ProjectRecord> {
    const p = await Project.create({
      name: input.name.trim(),
      description:        input.description ?? null,
      techStack:          input.techStack ?? null,
      partnerName:        input.partnerName ?? null,
      partnerContactName: input.partnerContactName ?? null,
      partnerEmail:       input.partnerEmail ?? null,
      partnerPhone:       input.partnerPhone ?? null,
      createdBy,
    });
    return toRecord(p);
  },

  async update(id: string, patch: UpdateProjectInput): Promise<ProjectRecord | null> {
    const p = await Project.findByPk(id);
    if (!p) return null;
    if (patch.name !== undefined) p.name = patch.name.trim();
    if (patch.description !== undefined) p.description = patch.description;
    if (patch.techStack !== undefined) p.techStack = patch.techStack;
    if (patch.partnerName !== undefined) p.partnerName = patch.partnerName;
    if (patch.partnerContactName !== undefined) p.partnerContactName = patch.partnerContactName;
    if (patch.partnerEmail !== undefined) p.partnerEmail = patch.partnerEmail;
    if (patch.partnerPhone !== undefined) p.partnerPhone = patch.partnerPhone;
    await p.save();
    return toRecord(p);
  },

  async archive(id: string): Promise<ProjectRecord | null> {
    const p = await Project.findByPk(id);
    if (!p) return null;
    p.status = 'archived';
    p.archivedAt = new Date();
    await p.save();
    return toRecord(p);
  },

  async unarchive(id: string): Promise<ProjectRecord | null> {
    const p = await Project.findByPk(id);
    if (!p) return null;
    p.status = 'active';
    p.archivedAt = null;
    await p.save();
    return toRecord(p);
  },

  async listForUser(
    userId: string,
    role: Role,
    opts: { includeArchived?: boolean } = {},
  ): Promise<ProjectRecord[]> {
    const statusFilter = opts.includeArchived ? {} : { status: 'active' as ProjectStatus };

    if (role === ROLES.SUPER_ADMIN) {
      const rows = await Project.findAll({ where: statusFilter, order: [['created_at', 'DESC']] });
      return rows.map(toRecord);
    }

    const rows = await Project.findAll({
      where: statusFilter,
      include: [{
        model: ProjectMember,
        as: 'members',
        required: true,
        where: { userId, removedAt: null },
        attributes: [],
      }],
      order: [['created_at', 'DESC']],
    });
    return rows.map(toRecord);
  },
};
