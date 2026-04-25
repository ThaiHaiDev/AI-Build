import request from 'supertest';
import { createApp } from '../app.js';

export const app = createApp();

export async function login(email: string, password: string): Promise<string> {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });
  if (res.status !== 200) throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.accessToken as string;
}

export async function getSAToken()    { return login('admin@example.com',  'Admin@12345'); }
export async function getAdminToken() { return login('leader@example.com', 'Leader@12345'); }
export async function getUserToken()  { return login('user@example.com',   'User@12345'); }

export function bearer(token: string) { return `Bearer ${token}`; }

export async function getProjectId(token: string, name: string): Promise<string> {
  const res = await request(app)
    .get('/api/v1/projects')
    .set('Authorization', bearer(token));
  const project = (res.body.projects as Array<{ id: string; name: string }>)
    .find((p) => p.name === name);
  if (!project) throw new Error(`Project "${name}" not found`);
  return project.id;
}
