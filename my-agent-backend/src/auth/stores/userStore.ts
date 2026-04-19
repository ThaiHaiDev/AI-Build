import { User } from '../../database/models/User.js';
import { ROLES, type Role } from '../constants.js';
import { hashPassword } from '../utils/hash.js';

export interface UserRecord {
  id:           string;
  email:        string;
  name:         string;
  passwordHash: string;
  role:         Role;
  createdAt:    Date;
}

const toRecord = (u: User): UserRecord => ({
  id: u.id,
  email: u.email,
  name: u.name,
  passwordHash: u.passwordHash,
  role: u.role,
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
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash: await hashPassword(input.password),
      role: input.role ?? ROLES.USER,
    });
    return toRecord(u);
  },

  async count(): Promise<number> {
    return User.count();
  },
};

export async function seedDemoUsers(): Promise<void> {
  if ((await userStore.count()) > 0) return;
  await userStore.create({ email: 'admin@example.com',  name: 'Admin',  password: 'Admin@12345',  role: ROLES.SUPER_ADMIN });
  await userStore.create({ email: 'leader@example.com', name: 'Leader', password: 'Leader@12345', role: ROLES.ADMIN });
  await userStore.create({ email: 'user@example.com',   name: 'User',   password: 'User@12345',   role: ROLES.USER });
  await userStore.create({ email: 'outsider@example.com', name: 'Outsider', password: 'Outsider@12345', role: ROLES.USER });
}
