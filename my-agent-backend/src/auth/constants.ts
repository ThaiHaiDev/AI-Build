export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN:       'admin',
  MANAGER:     'manager',
  EDITOR:      'editor',
  USER:        'user',
  GUEST:       'guest',
  ANONYMOUS:   'anonymous',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
export const ALL_ROLES: readonly Role[] = Object.values(ROLES);

export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]:        80,
  [ROLES.MANAGER]:      60,
  [ROLES.EDITOR]:       40,
  [ROLES.USER]:         20,
  [ROLES.GUEST]:        10,
  [ROLES.ANONYMOUS]:     0,
};

export const isAtLeast = (actual: Role, min: Role): boolean =>
  ROLE_HIERARCHY[actual] >= ROLE_HIERARCHY[min];

export const PERMISSIONS = {
  USER_READ:        'user:read',
  USER_WRITE:       'user:write',
  USER_DELETE:      'user:delete',
  USER_MANAGE:      'user:manage',
  SESSION_READ:     'session:read',
  SESSION_WRITE:    'session:write',
  SESSION_DELETE:   'session:delete',
  AGENT_READ:       'agent:read',
  AGENT_WRITE:      'agent:write',
  AGENT_DELETE:     'agent:delete',
  SYSTEM_CONFIG:    'system:config',
  SYSTEM_AUDIT_LOG: 'system:audit_log',
  BILLING_MANAGE:   'billing:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ, PERMISSIONS.USER_WRITE, PERMISSIONS.USER_DELETE, PERMISSIONS.USER_MANAGE,
    PERMISSIONS.SESSION_READ, PERMISSIONS.SESSION_WRITE, PERMISSIONS.SESSION_DELETE,
    PERMISSIONS.AGENT_READ, PERMISSIONS.AGENT_WRITE, PERMISSIONS.AGENT_DELETE,
    PERMISSIONS.SYSTEM_AUDIT_LOG,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_READ, PERMISSIONS.USER_WRITE,
    PERMISSIONS.SESSION_READ, PERMISSIONS.SESSION_WRITE,
    PERMISSIONS.AGENT_READ, PERMISSIONS.AGENT_WRITE,
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.AGENT_READ, PERMISSIONS.AGENT_WRITE,
    PERMISSIONS.SESSION_READ,
  ],
  [ROLES.USER]: [
    PERMISSIONS.SESSION_READ, PERMISSIONS.SESSION_WRITE,
    PERMISSIONS.AGENT_READ,
  ],
  [ROLES.GUEST]:     [PERMISSIONS.AGENT_READ],
  [ROLES.ANONYMOUS]: [],
};

export const TOKEN_TTL = {
  ACCESS:  15 * 60,
  REFRESH: 7  * 24 * 60 * 60,
  OTP:     5  * 60,
  RESET:   30 * 60,
} as const;

export const REFRESH_COOKIE_NAME = 'refresh_token';
