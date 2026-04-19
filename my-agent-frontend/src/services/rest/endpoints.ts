export const ENDPOINTS = {
  AUTH: {
    LOGIN:    '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT:   '/auth/logout',
    REFRESH:  '/auth/refresh',
    ME:       '/auth/me',
  },
  USERS: {
    LIST:   '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    SEARCH: '/users',
  },
  PROJECTS: {
    LIST:      '/projects',
    CREATE:    '/projects',
    DETAIL:    (id: string) => `/projects/${id}`,
    UPDATE:    (id: string) => `/projects/${id}`,
    ARCHIVE:   (id: string) => `/projects/${id}/archive`,
    UNARCHIVE: (id: string) => `/projects/${id}/unarchive`,
    MEMBERS:   (id: string) => `/projects/${id}/members`,
    MEMBER:    (id: string, userId: string) => `/projects/${id}/members/${userId}`,
  },
} as const
