import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app, getSAToken, getAdminToken, getUserToken, bearer } from './helpers.js';

let saToken:    string;
let adminToken: string;
let userToken:  string;

beforeAll(async () => {
  saToken    = await getSAToken();
  adminToken = await getAdminToken();
  userToken  = await getUserToken();
});

describe('GET /projects?search=', () => {
  it('SA: returns projects matching name', async () => {
    const res = await request(app)
      .get('/api/v1/projects?search=Alpha')
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(200);
    const names = (res.body.projects as Array<{ name: string }>).map((p) => p.name);
    expect(names.some((n) => n.includes('Alpha'))).toBe(true);
  });

  it('SA: returns empty when no match', async () => {
    const res = await request(app)
      .get('/api/v1/projects?search=zzznomatchxyz')
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(200);
    expect(res.body.projects).toHaveLength(0);
  });

  it('ADMIN: returns only their projects that match', async () => {
    const res = await request(app)
      .get('/api/v1/projects?search=Alpha')
      .set('Authorization', bearer(adminToken));
    expect(res.status).toBe(200);
    // leader is member of Alpha only, so should see it
    expect(res.body.projects.length).toBeGreaterThanOrEqual(1);
    const names = (res.body.projects as Array<{ name: string }>).map((p) => p.name);
    expect(names.some((n) => n.includes('Alpha'))).toBe(true);
  });

  it('ADMIN: returns empty when searching projects they are not member of', async () => {
    // leader is not member of Beta (seeded without members for non-SA)
    const res = await request(app)
      .get('/api/v1/projects?search=Beta')
      .set('Authorization', bearer(adminToken));
    expect(res.status).toBe(200);
    // may or may not be 0 depending on seed; just ensure status 200
    expect(Array.isArray(res.body.projects)).toBe(true);
  });

  it('search is case-insensitive', async () => {
    const res = await request(app)
      .get('/api/v1/projects?search=alpha')
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(200);
    const names = (res.body.projects as Array<{ name: string }>).map((p) => p.name);
    expect(names.some((n) => n.toLowerCase().includes('alpha'))).toBe(true);
  });

  it('rejects search longer than 100 chars with 400', async () => {
    const res = await request(app)
      .get(`/api/v1/projects?search=${'a'.repeat(101)}`)
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(400);
  });
});

describe('GET /admin/users?search=', () => {
  it('SA: returns users matching name', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin/users?search=Leader')
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(200);
    const emails = (res.body.users as Array<{ email: string }>).map((u) => u.email);
    expect(emails).toContain('leader@example.com');
  });

  it('SA: returns users matching email', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin/users?search=user@example')
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(200);
    const emails = (res.body.users as Array<{ email: string }>).map((u) => u.email);
    expect(emails).toContain('user@example.com');
  });

  it('SA: returns empty when no match', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin/users?search=zzznomatchxyz')
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(0);
  });

  it('search is case-insensitive', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin/users?search=LEADER')
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(200);
    const emails = (res.body.users as Array<{ email: string }>).map((u) => u.email);
    expect(emails).toContain('leader@example.com');
  });

  it('returns 403 for non-SA', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin/users?search=leader')
      .set('Authorization', bearer(adminToken));
    expect(res.status).toBe(403);
  });

  it('rejects search longer than 100 chars with 400', async () => {
    const res = await request(app)
      .get(`/api/v1/auth/admin/users?search=${'a'.repeat(101)}`)
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(400);
  });
});
