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
  WILDCARD:         '*',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS] | (string & {})
