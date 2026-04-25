# Sprint 04 — User Management · History

> Log mọi thay đổi: task code done, bug fix, quyết định mới. Format: Outcome / Files / Follow-up.

---

## 2026-04-25 · BE Sprint 04 — User Management + Env-Level Permission (Track A + B hoàn tất)

**Outcome**: Backend Sprint 04 implement xong, build TypeScript sạch.

**Track A — User Management**

- `userStore` mở rộng: `listAll`, `changeRole`, `deactivate`, `updateName`, `updatePasswordHash`, `isActive` vào `UserRecord`
- `AdminController`: `listUsers`, `createUser`, `changeRole`, `deactivate` — SA only
- `MeController`: `updateName` (`PATCH /auth/me`), `changePassword` (`PATCH /auth/me/password`)
- `requireAuth` nay check `isActive` — deactivated user bị block ngay lập tức (không cần đợi token expire)
- `refreshTokenStore.revokeUser` được gọi khi deactivate + đổi password để force logout mọi phiên

**Track B — Env-Level Permission**

- `ProjectMember` model: thêm cột `allowedEnvs: TEXT[]`, DB default `['dev','staging','production']` (backfill rows cũ tự động qua `sequelize.sync({ alter: true })`)
- `projectMemberStore`: `getActiveMember` (trả `allowedEnvs`), `addMember` nhận `allowedEnvs` (app default `['dev']`), `updateEnvAccess`, `listMembers` trả `allowedEnvs`
- `requireAccountAccess`: gắn `req.memberEnvs` — SA nhận `['dev','staging','production']`, member nhận `allowedEnvs` của mình
- `TestAccountController`: `list` filter + trả `grantedEnvs`; `getById`/`create`/`update`/`delete` check `assertEnvAccess`
- `ProjectController.addMember` nhận `allowedEnvs` từ body; thêm handler `updateEnvAccess` với guard Admin-cannot-grant-beyond-own-envs
- Route mới: `PATCH /api/v1/projects/:id/members/:memberId/env-access`

**Files changed**:
- `src/shared/errors.ts` — thêm `SelfActionForbiddenError`, `EnvAccessForbiddenError`
- `src/auth/types.ts` — thêm `memberEnvs?: string[]` vào Express Request
- `src/database/models/ProjectMember.ts` — thêm `allowedEnvs`, export `ALL_ENVS`, `Environment`
- `src/auth/stores/userStore.ts` — mở rộng
- `src/projects/stores/projectMemberStore.ts` — mở rộng
- `src/projects/middlewares/requireAccountAccess.ts` — gắn `memberEnvs`
- `src/auth/middlewares/requireAuth.ts` — check `isActive`
- `src/projects/controllers/TestAccountController.ts` — env filtering
- `src/projects/controllers/ProjectController.ts` — `addMember` + `updateEnvAccess`
- `src/projects/schemas/project.schema.ts` — `addMemberSchema` + `envAccessSchema`
- `src/auth/schemas/admin.schema.ts` — **NEW** Zod schemas admin/me
- `src/auth/controllers/AdminController.ts` — **NEW**
- `src/auth/controllers/MeController.ts` — **NEW**
- `src/auth/routes.ts` — thêm admin + me routes
- `src/projects/routes.ts` — thêm env-access route

**Follow-up**:
- [ ] FE implement Track A (User Management UI) + Track B (env checkbox UI)
- [ ] Integration tests B70–B74, A40–A43
- [ ] Seed demo `seedDemoProjects` cần update `addMember` calls để truyền `allowedEnvs` nếu cần demo cụ thể
