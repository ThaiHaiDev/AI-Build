import { ROLE_PERMISSIONS, type Permission, type Role } from '../constants.js';

export interface PublicUser {
  id:          string;
  email:       string;
  name:        string;
  role:        Role;
  permissions: Permission[];
  createdAt:   string;
}

export interface PublicUserSource {
  id:        string;
  email:     string;
  name:      string;
  role:      Role;
  createdAt: Date;
}

export const toPublicUser = (u: PublicUserSource): PublicUser => ({
  id:          u.id,
  email:       u.email,
  name:        u.name,
  role:        u.role,
  permissions: [...ROLE_PERMISSIONS[u.role]],
  createdAt:   u.createdAt.toISOString(),
});
