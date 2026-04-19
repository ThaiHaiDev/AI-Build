import { ProjectMember } from '../../database/models/ProjectMember.js';
import { User } from '../../database/models/User.js';
import type { Role } from '../../auth/constants.js';

export interface ProjectMemberView {
  id:        string;
  userId:    string;
  email:     string;
  name:      string;
  role:      Role;
  addedAt:   Date;
  addedBy:   string;
}

export const projectMemberStore = {
  async isActiveMember(projectId: string, userId: string): Promise<boolean> {
    const count = await ProjectMember.count({ where: { projectId, userId, removedAt: null } });
    return count > 0;
  },

  async addMember(projectId: string, userId: string, addedBy: string): Promise<ProjectMember> {
    return ProjectMember.create({ projectId, userId, addedBy });
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
        id:       r.id,
        userId:   r.userId,
        email:    u.email,
        name:     u.name,
        role:     u.role,
        addedAt:  r.addedAt,
        addedBy:  r.addedBy,
      };
    });
  },
};
