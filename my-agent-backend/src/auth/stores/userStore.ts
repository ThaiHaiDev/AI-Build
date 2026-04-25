import { Op } from 'sequelize';
import { User } from '../../database/models/User.js';
import { ROLES, type Role } from '../constants.js';
import { hashPassword } from '../utils/hash.js';

export interface UserRecord {
  id:           string;
  email:        string;
  name:         string;
  passwordHash: string;
  role:         Role;
  isActive:     boolean;
  createdAt:    Date;
}

export interface UserListItem {
  id:        string;
  email:     string;
  name:      string;
  role:      Role;
  isActive:  boolean;
  createdAt: Date;
}

const toRecord = (u: User): UserRecord => ({
  id:           u.id,
  email:        u.email,
  name:         u.name,
  passwordHash: u.passwordHash,
  role:         u.role,
  isActive:     u.isActive,
  createdAt:    u.createdAt,
});

const toListItem = (u: User): UserListItem => ({
  id:        u.id,
  email:     u.email,
  name:      u.name,
  role:      u.role,
  isActive:  u.isActive,
  createdAt: u.createdAt,
});

export const userStore = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const u = await User.findOne({ where: { email: email.toLowerCase() } });
    return u ? toRecord(u) : null;
  },

  async findById(id: string): Promise<UserRecord | null> {
    const u = await User.findByPk(id);
    return u ? toRecord(u) : null;
  },

  async create(input: { email: string; name: string; password: string; role?: Role }): Promise<UserRecord> {
    const u = await User.create({
      email:        input.email.toLowerCase(),
      name:         input.name,
      passwordHash: await hashPassword(input.password),
      role:         input.role ?? ROLES.USER,
    });
    return toRecord(u);
  },

  async listAll(opts: { role?: Role; isActive?: boolean; search?: string } = {}): Promise<UserListItem[]> {
    const where: Record<string, unknown> = {};
    if (opts.role !== undefined)     where.role     = opts.role;
    if (opts.isActive !== undefined) where.isActive = opts.isActive;
    if (opts.search) {
      const term = `%${opts.search}%`;
      where[Op.or as unknown as string] = [
        { name:  { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
      ];
    }
    const rows = await User.findAll({ where, order: [['created_at', 'ASC']] });
    return rows.map(toListItem);
  },

  async changeRole(id: string, newRole: Role): Promise<UserRecord | null> {
    const u = await User.findByPk(id);
    if (!u) return null;
    u.role = newRole;
    await u.save();
    return toRecord(u);
  },

  async deactivate(id: string): Promise<UserRecord | null> {
    const u = await User.findByPk(id);
    if (!u) return null;
    u.isActive = false;
    await u.save();
    return toRecord(u);
  },

  async updateName(id: string, name: string): Promise<UserRecord | null> {
    const u = await User.findByPk(id);
    if (!u) return null;
    u.name = name;
    await u.save();
    return toRecord(u);
  },

  async updatePasswordHash(id: string, passwordHash: string): Promise<boolean> {
    const [count] = await User.update({ passwordHash }, { where: { id } });
    return count > 0;
  },

  async findByEmailExcluding(email: string, excludeId: string): Promise<UserRecord | null> {
    const u = await User.findOne({ where: { email: email.toLowerCase(), id: { [Op.ne]: excludeId } } });
    return u ? toRecord(u) : null;
  },

  async count(): Promise<number> {
    return User.count();
  },
};

const DEMO_USERS: Array<{ email: string; name: string; password: string; role: Role }> = [
  { email: 'admin@example.com',    name: 'Admin',    password: 'Admin@12345',    role: ROLES.SUPER_ADMIN },
  { email: 'leader@example.com',   name: 'Leader',   password: 'Leader@12345',   role: ROLES.ADMIN },
  { email: 'user@example.com',     name: 'User',     password: 'User@12345',     role: ROLES.USER },
  { email: 'outsider@example.com', name: 'Outsider', password: 'Outsider@12345', role: ROLES.USER },
];

export async function seedDemoUsers(): Promise<void> {
  for (const u of DEMO_USERS) {
    const existing = await User.findOne({ where: { email: u.email } });
    if (!existing) {
      await userStore.create(u);
    } else if (existing.role !== u.role) {
      existing.role = u.role;
      await existing.save();
    }
  }
}
