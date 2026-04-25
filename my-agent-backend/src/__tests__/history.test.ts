import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app, getSAToken, getAdminToken, getUserToken, bearer, getProjectId } from './helpers.js';

let saToken:    string;
let adminToken: string;
let userToken:  string;
let alphaId:    string;

beforeAll(async () => {
  saToken    = await getSAToken();
  adminToken = await getAdminToken();
  userToken  = await getUserToken();
  alphaId    = await getProjectId(saToken, 'Project Alpha');
});

describe('GET /projects/:id/history', () => {
  it('returns 200 with entries array for ADMIN', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${alphaId}/history`)
      .set('Authorization', bearer(adminToken));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ entries: expect.any(Array), total: expect.any(Number), page: 1, limit: 20 });
  });

  it('returns 200 for SUPER_ADMIN', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${alphaId}/history`)
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(200);
  });

  it('returns 403 for USER role', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${alphaId}/history`)
      .set('Authorization', bearer(userToken));
    expect(res.status).toBe(403);
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${alphaId}/history`);
    expect(res.status).toBe(401);
  });

  it('records a history entry after creating a test account', async () => {
    // Create a test account
    const label = `__test_${Date.now()}`;
    const createRes = await request(app)
      .post(`/api/v1/projects/${alphaId}/accounts`)
      .set('Authorization', bearer(adminToken))
      .send({ label, environment: 'dev', username: 'tester', password: 'pass1234' });
    expect(createRes.status).toBe(201);
    const accountId = createRes.body.account.id as string;

    // Check history
    const histRes = await request(app)
      .get(`/api/v1/projects/${alphaId}/history?resourceType=test_account`)
      .set('Authorization', bearer(adminToken));
    expect(histRes.status).toBe(200);
    const entry = (histRes.body.entries as Array<{ resourceName: string; action: string }>)
      .find((e) => e.resourceName === label && e.action === 'create');
    expect(entry).toBeDefined();

    // Cleanup
    await request(app)
      .delete(`/api/v1/projects/${alphaId}/accounts/${accountId}`)
      .set('Authorization', bearer(adminToken));
  });

  it('records update and delete history entries', async () => {
    const label = `__test_upd_${Date.now()}`;
    const createRes = await request(app)
      .post(`/api/v1/projects/${alphaId}/accounts`)
      .set('Authorization', bearer(adminToken))
      .send({ label, environment: 'dev', username: 'u', password: 'pass1234' });
    expect(createRes.status).toBe(201);
    const accountId = createRes.body.account.id as string;

    // Update
    await request(app)
      .patch(`/api/v1/projects/${alphaId}/accounts/${accountId}`)
      .set('Authorization', bearer(adminToken))
      .send({ label: `${label}_v2` });

    // Delete
    await request(app)
      .delete(`/api/v1/projects/${alphaId}/accounts/${accountId}`)
      .set('Authorization', bearer(adminToken));

    // Wait for fire-and-forget history writes to complete
    await new Promise((r) => setTimeout(r, 150));

    const histRes = await request(app)
      .get(`/api/v1/projects/${alphaId}/history?resourceType=test_account`)
      .set('Authorization', bearer(adminToken));

    const entries = histRes.body.entries as Array<{ resourceName: string; action: string }>;
    // update: resourceName is the label at time of update (original)
    expect(entries.find((e) => e.resourceName === label          && e.action === 'update')).toBeDefined();
    // delete: resourceName is the label at time of delete (updated label)
    expect(entries.find((e) => e.resourceName === `${label}_v2` && e.action === 'delete')).toBeDefined();
  });

  it('supports pagination params', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${alphaId}/history?page=1&limit=5`)
      .set('Authorization', bearer(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(5);
    expect(res.body.entries.length).toBeLessThanOrEqual(5);
  });
});

describe('GET /admin/history', () => {
  it('returns 200 with entries for SUPER_ADMIN', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin/history')
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ entries: expect.any(Array), total: expect.any(Number) });
  });

  it('returns 403 for ADMIN role', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin/history')
      .set('Authorization', bearer(adminToken));
    expect(res.status).toBe(403);
  });

  it('filters by resourceType', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin/history?resourceType=test_account')
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(200);
    const entries = res.body.entries as Array<{ resourceType: string }>;
    expect(entries.every((e) => e.resourceType === 'test_account')).toBe(true);
  });

  it('rejects invalid resourceType with 400', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin/history?resourceType=invalid_type')
      .set('Authorization', bearer(saToken));
    expect(res.status).toBe(400);
  });
});
