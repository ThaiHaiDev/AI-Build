export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN:       'admin',
  MANAGER:     'manager',
  EDITOR:      'editor',
  USER:        'user',
  GUEST:       'guest',
  ANONYMOUS:   'anonymous',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]:        80,
  [ROLES.MANAGER]:      60,
  [ROLES.EDITOR]:       40,
  [ROLES.USER]:         20,
  [ROLES.GUEST]:        10,
  [ROLES.ANONYMOUS]:     0,
}

export const isAtLeast = (actual: Role | undefined, min: Role): boolean =>
  !!actual && ROLE_HIERARCHY[actual] >= ROLE_HIERARCHY[min]

export const ROLE_LABEL_I18N_KEY: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: 'role.super_admin',
  [ROLES.ADMIN]:       'role.admin',
  [ROLES.MANAGER]:     'role.manager',
  [ROLES.EDITOR]:      'role.editor',
  [ROLES.USER]:        'role.user',
  [ROLES.GUEST]:       'role.guest',
  [ROLES.ANONYMOUS]:   'role.anonymous',
}
