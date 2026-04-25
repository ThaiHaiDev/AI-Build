import { ProjectMember, ALL_ENVS } from '../../database/models/ProjectMember.js';
import { User } from '../../database/models/User.js';
import type { Role } from '../../auth/constants.js';

export interface ProjectMemberView {
  id:          string;
  userId:      string;
  email:       string;
  name:        string;
  role:        Role;
  allowedEnvs: string[];
  addedAt:     Date;
  addedBy:     string;
}

export interface ActiveMemberRecord {
  id:          string;
  userId:      string;
  allowedEnvs: string[];
}

export const projectMemberStore = {
  async isActiveMember(projectId: string, userId: string): Promise<boolean> {
    const count = await ProjectMember.count({ where: { projectId, userId, removedAt: null } });
    return count > 0;
  },

  async getActiveMember(projectId: string, userId: string): Promise<ActiveMemberRecord | null> {
    const row = await ProjectMember.findOne({ where: { projectId, userId, removedAt: null } });
    if (!row) return null;
    return { id: row.id, userId: row.userId, allowedEnvs: row.allowedEnvs ?? [...ALL_ENVS] };
  },

  async addMember(
    projectId: string,
    userId: string,
    addedBy: string,
    allowedEnvs: string[] = ['dev'],
  ): Promise<ProjectMember> {
    return ProjectMember.create({ projectId, userId, addedBy, allowedEnvs });
  },

  async removeMember(projectId: string, userId: string): Promise<boolean> {
    const row = await ProjectMember.findOne({ where: { projectId, userId, removedAt: null } });
    if (!row) return false;
    row.removedAt = new Date();
    await row.save();
    return true;
  },

  async listMembers(projectId: string): Promise<ProjectMemberView[]> {
    const rows = await ProjectMember.findAll({
      where: { projectId, removedAt: null },
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'name', 'role'] }],
      order: [['added_at', 'ASC']],
    });
    return rows.map((r) => {
      const u = (r as ProjectMember & { user: User }).user;
      return {
        id:          r.id,
        userId:      r.userId,
        email:       u.email,
        name:        u.name,
        role:        u.role,
        allowedEnvs: r.allowedEnvs ?? [...ALL_ENVS],
        addedAt:     r.addedAt,
        addedBy:     r.addedBy,
      };
    });
  },

  async updateEnvAccess(projectId: string, memberId: string, allowedEnvs: string[]): Promise<ActiveMemberRecord | null> {
    const row = await ProjectMember.findOne({ where: { id: memberId, projectId, removedAt: null } });
    if (!row) return null;
    row.allowedEnvs = allowedEnvs;
    await row.save();
    return { id: row.id, userId: row.userId, allowedEnvs: row.allowedEnvs };
  },
};
