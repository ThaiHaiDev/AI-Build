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
- [x] FE implement Track A (User Management UI) + Track B (env checkbox UI) — done 2026-04-25
- [ ] Integration tests B70–B74, A40–A43
- [ ] Seed demo `seedDemoProjects` cần update `addMember` calls để truyền `allowedEnvs` nếu cần demo cụ thể

---

## 2026-04-25 · FE Sprint 04 — User Management + Env-Level Permission (Track A + B hoàn tất)

**Outcome**: Frontend Sprint 04 implement xong, TypeScript build sạch (0 error).

**Track A — User Management**

- `meService`: thay mock bằng real API — `updateName` (`PATCH /auth/me`), `changePassword` (`PATCH /auth/me/password`)
- `MePage`: wire `updateName` thật vào store (`setAuth`); thêm section "Đổi mật khẩu" (current/new/confirm, validation client + server error)
- `AdminUsersPage` (`/admin/users`): bảng user, filter role + status, badge Active/Deactivated
  - Dual-fetch trick: gọi cả `listUsers()` + `listUsers({ isActive: 'false' })` để build `deactivatedIds` set vì `isActive` chưa có trong `PublicUser` response
  - Inline role dropdown → confirm dialog → `PATCH /admin/users/:id/role`
  - Deactivate button → confirm dialog → `PATCH /admin/users/:id/deactivate` → row fade + badge
  - "+ Tạo user" modal (email, name, password, role)
- `ACCOUNT_DEACTIVATED` global handling: `api.ts` interceptor check error code trước khi thử refresh → force logout ngay

**Track B — Env-Level Permission**

- `VaultTab`: dùng `grantedEnvs` từ response thay vì hardcode `ENVIRONMENTS`; `AccountsByEnv` type đổi thành `Partial`
- `AddMemberModal`: thêm env checkboxes (Dev/Staging/Production, default Dev) → truyền `allowedEnvs` vào `addMember`
- `ProjectDetailPage`: hiện `allowedEnvs` badges (màu theo env) trên từng member row; nút "Sửa quyền env" → inline `<Modal>` với checkboxes → `PATCH /env-access`

**Files changed**:
- `src/services/rest/endpoints.ts` — thêm `ADMIN`, `AUTH.ME_PASSWORD`, `PROJECTS.MEMBER_ENV_ACCESS`
- `src/services/rest/api.ts` — xử lý `ACCOUNT_DEACTIVATED` → force logout
- `src/features/projects/types/project.types.ts` — `ProjectMember.allowedEnvs`, `AccountsByEnv` → Partial, thêm `VaultListResponse`
- `src/features/projects/services/projectService.ts` — `addMember` nhận `allowedEnvs`, thêm `updateEnvAccess`
- `src/features/projects/services/vaultService.ts` — `list` trả `VaultListResponse`
- `src/features/projects/components/VaultTab.tsx` — `grantedEnvs` filtering
- `src/features/projects/components/AddMemberModal.tsx` — env checkboxes
- `src/features/me/services/meService.ts` — **REWRITE** real API calls
- `src/pages/Me/MePage.tsx` — real name update + password change section
- `src/pages/ProjectDetail/ProjectDetailPage.tsx` — env badges + env-access modal
- `src/features/admin/types/admin.types.ts` — **NEW**
- `src/features/admin/services/adminService.ts` — **NEW**
- `src/pages/AdminUsers/AdminUsersPage.tsx` — **NEW**
- `src/pages/AdminUsers/index.ts` — **NEW**
- `src/router/routes.ts` — thêm `/admin/users`
- `src/locales/en/admin.json` — **NEW**
- `src/locales/vi/admin.json` — **NEW**
- `src/locales/en/me.json` — thêm password change keys
- `src/locales/vi/me.json` — thêm password change keys
- `src/locales/en/projects.json` — thêm env-access keys
- `src/locales/vi/projects.json` — thêm env-access keys
- `src/locales/en/index.ts` + `vi/index.ts` — export namespace `admin`
- `src/lib/i18n.ts` — thêm `admin` vào `ns` array

**Follow-up**:
- [ ] Integration tests B70–B74, A40–A43
- [ ] Thêm link `/admin/users` vào sidebar/nav (chỉ hiện với SA)
- [ ] Seed demo update `addMember` calls truyền `allowedEnvs`
