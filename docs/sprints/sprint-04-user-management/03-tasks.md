# Sprint 04 — User Management · Tasks

> **Atomic checklist** • Status: Draft • Updated: 2026-04-25
> Mỗi task ≤ 30–60 phút. Tick `[x]` khi xong. Liên kết commit ở `04-history.md`.
> Hai track A (User Management) và B (Env Permission) chạy song song.

---

## Track A — User Management

### Foundation

- [ ] **A10** · Thêm cột `status: enum('active','deactivated')` vào `User` model + migration (nếu chưa có)
- [ ] **A11** · Tạo `userManagementStore` / service: `listAll({ roleFilter, statusFilter })`, `createUser({ email, name, password, role })`, `changeRole(userId, newRole)`, `deactivate(userId)`, `reactivate(userId)` (dự phòng)
- [ ] **A12** · Seed: 3 user mẫu (1 SA, 1 Admin, 1 User) — chỉ seed khi `count() === 0`

### Endpoints

- [ ] **A20** · `GET /admin/users` — Danh sách user; query params: `role`, `status`, `page`, `limit`; SA only
- [ ] **A21** · `POST /admin/users` — Tạo user mới (email, name, password, role); SA only; validate email unique + password strength
- [ ] **A22** · `PATCH /admin/users/:userId/role` — Đổi role; SA only; không tự đổi role của chính mình
- [ ] **A23** · `PATCH /admin/users/:userId/deactivate` — Deactivate; SA only; không tự deactivate chính mình; invalidate tất cả refresh token của user đó
- [ ] **A24** · `PATCH /me` — User tự sửa tên (`name`); yêu cầu login
- [ ] **A25** · `PATCH /me/password` — Đổi password (gửi `currentPassword` + `newPassword` + `confirmPassword`); verify `currentPassword` trước khi update

### Security & Error handling

- [ ] **A30** · Tất cả `/admin/*` endpoint có `requireAuth` + `requireRole('super_admin')`
- [ ] **A31** · SA deactivate chính mình → 403 `SELF_ACTION_FORBIDDEN`
- [ ] **A32** · SA đổi role chính mình → 403 `SELF_ACTION_FORBIDDEN`
- [ ] **A33** · User deactivated cố refresh token → 401 `ACCOUNT_DEACTIVATED`; FE auto-logout
- [ ] **A34** · Không log password trong pino (đã có redaction; verify lại cho endpoint mới)

### Testing

- [ ] **A40** · Integration test `GET /admin/users`: SA success, Admin 403, User 403
- [ ] **A41** · Integration test `POST /admin/users`: email duplicate → 400; password yếu → 400; thành công → 201
- [ ] **A42** · Integration test deactivate: user deactivated → refresh token 401
- [ ] **A43** · Integration test `PATCH /me/password`: wrong current password → 400; success → 200

---

## Track B — Env-Level Permission (Account Vault)

### Model & Migration

- [ ] **B50** · Migration thêm cột `allowedEnvs: ARRAY<ENUM('dev','staging','production')>` vào `ProjectMember`; default `['dev']`; NOT NULL
- [ ] **B51** · Update `ProjectMember` model (Sequelize): khai báo field `allowedEnvs`, type `ARRAY(ENUM(...))`, defaultValue `['dev']`
- [ ] **B52** · Backfill migration: `ProjectMember` rows hiện có (từ sprint-02/03) set `allowedEnvs = ['dev', 'staging', 'production']` (không bị mất quyền đột ngột với data cũ)

### Service & Middleware

- [ ] **B53** · Cập nhật `requireAccountAccess` middleware: sau khi confirm active member, lấy `allowedEnvs`; gắn vào `req.memberEnvs` để controller dùng
- [ ] **B54** · Tạo helper `filterAccountsByEnv(accounts, allowedEnvs)`: filter grouped accounts object theo env list
- [ ] **B55** · Tạo / update `memberStore`: thêm `updateEnvAccess(projectId, memberId, allowedEnvs)` + validate không grant env ngoài `allowedEnvs` của actor

### Endpoints

- [ ] **B60** · Update `GET /projects/:id/accounts`: áp `filterAccountsByEnv`; thêm field `grantedEnvs` vào response; SA bypass filter
- [ ] **B61** · Update `POST /projects/:id/accounts`: kiểm tra `body.environment` nằm trong `req.memberEnvs` (SA bypass); 403 `ENV_ACCESS_FORBIDDEN` nếu không
- [ ] **B62** · Update `PATCH /projects/:id/accounts/:accountId`: kiểm tra `account.environment` (và `body.environment` nếu có) nằm trong `req.memberEnvs`
- [ ] **B63** · Update `DELETE /projects/:id/accounts/:accountId`: kiểm tra `account.environment` trong `req.memberEnvs`
- [ ] **B64** · `PATCH /projects/:id/members/:memberId/env-access` — Set `allowedEnvs`; SA or Admin active member; validate subset + non-empty + Admin không grant env vượt quyền; response trả `member` với `allowedEnvs` mới

### Testing

- [ ] **B70** · Integration test: member `allowedEnvs=['dev']` gọi `GET /accounts` → chỉ thấy dev accounts; không thấy staging/production
- [ ] **B71** · Integration test: SA gọi `GET /accounts` → thấy cả 3 env (bypass `allowedEnvs`)
- [ ] **B72** · Integration test: Admin `allowedEnvs=['dev']` cố `POST` account vào `staging` → 403 `ENV_ACCESS_FORBIDDEN`
- [ ] **B73** · Integration test: Admin cố grant `production` cho member khi mình chỉ có `['dev','staging']` → 403
- [ ] **B74** · Integration test: `PATCH /env-access` thành công → member gọi GET ngay sau thấy env mới

---

## 🎨 FE — User Management UI

### Admin Panel

- [ ] **FE-A10** · Trang `/admin/users`: bảng user với cột avatar, tên, email, role badge, status badge, ngày tạo
- [ ] **FE-A11** · Filter bar: dropdown role, dropdown status; áp filter → refetch
- [ ] **FE-A12** · Modal "+ Tạo user": form `react-hook-form` + Zod (email, tên, password, role dropdown); submit gọi `POST /admin/users`
- [ ] **FE-A13** · Inline action "Đổi role": dropdown chọn role mới → confirm dialog → gọi `PATCH /admin/users/:id/role`
- [ ] **FE-A14** · Inline action "Deactivate": confirm dialog → gọi `PATCH /admin/users/:id/deactivate`; row chuyển sang mờ + badge "Deactivated"

### Profile (Me)

- [ ] **FE-A20** · Trang `/me` section sửa tên: click "Sửa" → inline input → save → gọi `PATCH /me`
- [ ] **FE-A21** · Trang `/me` section đổi password: form 3 field (current, new, confirm) + Zod validate; submit gọi `PATCH /me/password`

---

## 🎨 FE — Env Permission UI

- [ ] **FE-B10** · Tab "Tài khoản test": ẩn hoàn toàn section env không có trong `grantedEnvs` (đọc từ response field `grantedEnvs`)
- [ ] **FE-B11** · Modal "Thêm / Sửa quyền member" (trong tab Thành viên dự án): thêm checkbox group env (Dev / Staging / Production); default tick Dev khi thêm mới
- [ ] **FE-B12** · Khi SA/Admin xem danh sách member: hiện badge env được cấp (`dev`, `stg`, `prod`) bên cạnh role
- [ ] **FE-B13** · Nút "Sửa quyền env" → mở mini-modal checkbox → submit gọi `PATCH /projects/:id/members/:memberId/env-access`
- [ ] **FE-B14** · i18n: thêm key cho tất cả label mới (env names, error messages, empty state)
