# Sprint 05 — History Module + Polish & Onboarding UX · Tasks

> **Atomic checklist** • Status: Draft • Updated: 2026-04-25
> Mỗi task ≤ 30–60 phút. Tick `[x]` khi xong. Liên kết commit ở `04-history.md`.
> Ba track chạy song song: A (History Module), B (Search & Filter), C (UX Polish).

---

## Track A — History Module

### BE — Model & Store

- [ ] **A10** · Tạo model `History`: `id`, `actorId`, `action` (string), `resourceType` (enum), `resourceId`, `resourceName`, `projectId` (nullable), `meta: JSONB`, `createdAt`
- [ ] **A11** · Index: `(resourceType, createdAt DESC)`, `(projectId, createdAt DESC)` — đủ cho MVP filter pattern
- [ ] **A12** · Tạo `historyStore`:
  - `append(entry)` — insert 1 row, return void, không throw (caller dùng fire-and-forget)
  - `listByProject(projectId, opts: { resourceType?, action?, page, limit })` — Admin dự án dùng
  - `listGlobal(opts: { resourceType?, action?, actorId?, projectId?, from?, to?, page, limit })` — SA only

### BE — Hook vào các controller (fire-and-forget)

- [ ] **A13** · `TestAccountController`: hook `historyStore.append` sau `create`, `update`, `delete`
  - `resourceName`: `"${account.label} – ${account.environment}"`
  - `meta.before/after`: `{ label, username, url, note }` (không có password)
- [ ] **A14** · `ProjectController`: hook sau `create`, `update`, `archive`, `unarchive`
  - `resourceName`: tên dự án
  - `meta.after`: `{ name, description, techStack, status }`
- [ ] **A15** · `ProjectController.addMember`, `removeMember`, `updateEnvAccess`: hook sau mỗi action
  - `resourceType: 'member'`
  - `resourceName`: tên user được thêm/gỡ/sửa env
  - `meta.after`: `{ userId, allowedEnvs }` nếu là env_access_updated
- [ ] **A16** · `AdminController`: hook sau `createUser`, `changeRole`, `deactivateUser`
  - `resourceType: 'user'`
  - `resourceName`: email user bị tác động
  - `meta.after`: `{ role }` nếu role_changed

### BE — Endpoints

- [ ] **A20** · `GET /projects/:id/history` — lịch sử dự án (test_account + member); Auth: Admin member hoặc SA; query: `resourceType`, `action`, `page`, `limit` (default 20)
- [ ] **A21** · `GET /admin/history` — lịch sử toàn hệ thống; SA only; query: `resourceType`, `action`, `actorId`, `projectId`, `from`, `to`, `page`, `limit`
- [ ] **A22** · Response shape mỗi entry:
  ```json
  {
    "id":           "uuid",
    "actorName":    "Nguyễn Văn A",
    "actorEmail":   "a@example.com",
    "action":       "updated",
    "resourceType": "test_account",
    "resourceName": "Staging Admin – staging",
    "projectName":  "Project Alpha",
    "meta":         { "before": {}, "after": {} },
    "createdAt":    "2026-04-25T10:00:00Z"
  }
  ```
- [ ] **A23** · Viết `05-api-docs.md` — bổ sung history endpoints + shape cho FE

### FE — History

- [ ] **A30** · Tạo `src/features/history/types/history.types.ts` — `HistoryEntry`, `HistoryListResponse`
- [ ] **A31** · Tạo `src/features/history/services/historyService.ts` — `listByProject(projectId, params)`, `listGlobal(params)`
- [ ] **A32** · Thêm endpoint constants vào `endpoints.ts`: `PROJECTS.HISTORY(id)`, `ADMIN.HISTORY`
- [ ] **A33** · Thêm tab "Lịch sử" vào `ProjectDetailPage` — chỉ hiện với Admin+ (check `isAtLeast(role, ADMIN)`)
- [ ] **A34** · Tạo `HistoryTab` component — timeline list: actor, action label, resource name, thời gian tương đối (`2 giờ trước`); nút "Load thêm" (cursor-based hoặc offset pagination)
- [ ] **A35** · Tạo `src/pages/AdminHistory/AdminHistoryPage.tsx` — bảng, filter: resourceType + action + project + date range; phân trang
- [ ] **A36** · Thêm route `/admin/history` vào `routes.ts`
- [ ] **A37** · i18n: `en/history.json` + `vi/history.json` — action labels + resourceType labels
- [ ] **A38** · Export namespace `history` trong `locales/en/index.ts` + `vi/index.ts`; thêm vào `lib/i18n.ts`

---

## Track B — Search & Filter

### BE

- [ ] **B10** · `GET /projects` — thêm query param `search`: ILIKE trên `name`, `techStack`, `partnerName`; kết hợp được với `includeArchived`
- [ ] **B11** · `GET /auth/admin/users` — thêm query param `search`: ILIKE trên `name`, `email`; kết hợp được với `role`, `isActive`

### FE

- [ ] **B20** · `ProjectsPage` — thêm search input, debounce 300ms, truyền `search` vào `projectService.list`
- [ ] **B21** · `AdminUsersPage` — thêm search input, debounce 300ms, truyền `search` vào `adminService.listUsers`
- [ ] **B22** · Empty state "Không tìm thấy kết quả cho «…»" khi search trả về 0 (khác empty state "chưa có dữ liệu")
- [ ] **B23** · i18n: thêm key `search_placeholder` và `no_search_results` vào `projects.json` + `admin.json`

---

## Track C — UX Polish

### Navigation SA

- [ ] **C10** · Sidebar/nav: thêm section "Admin" với link `/admin/users` + `/admin/history`, chỉ render khi `user.role === 'super_admin'`
- [ ] **C11** · Active link highlight theo route hiện tại (dùng `useLocation` hoặc NavLink)

### Empty states

- [ ] **C20** · `ProjectsPage` empty state phân theo role:
  - SA/Admin: "Chưa có dự án nào." + nút "+ Tạo dự án"
  - User: "Bạn chưa được thêm vào dự án nào. Liên hệ leader hoặc SA của bạn."
- [ ] **C21** · `DashboardPage` empty state tương tự cho user chưa có dự án
- [ ] **C22** · `VaultTab` — nếu `grantedEnvs` rỗng: hiện "Bạn chưa được cấp quyền xem môi trường nào. Liên hệ Admin của dự án."

### Loading states

- [ ] **C30** · Skeleton loader cho `ProjectsPage` (card grid — 3 placeholder cards)
- [ ] **C31** · Skeleton loader cho `ProjectDetailPage` header + tab content

### Error handling

- [ ] **C32** · Error boundary ở route level (`ErrorBoundary` wrap từng lazy page): hiện "Có lỗi xảy ra" + nút "Tải lại trang"
- [ ] **C33** · Axios interceptor: khi `error.code === 'ECONNABORTED'` (timeout) hoặc không có `error.response` → `toast.error(t('common:error_network'))`

### Me page cleanup

- [ ] **C40** · `MePage` — ẩn field "Department" và "Manager" (không có backend, gây hiểu nhầm); giữ lại Name, Email, Employee ID, Joined

### i18n

- [ ] **C50** · `common.json` (en + vi): thêm `error_network`, `load_more`, `no_results`, `loading`
- [ ] **C51** · `projects.json` (en + vi): thêm `list.empty_user`, `list.empty_admin`, `list.no_search_results`

---

## Acceptance criteria tổng

- [ ] Admin sửa account test → tab "Lịch sử" hiện đúng entry với actor + action + resource + time.
- [ ] SA vào `/admin/history` → filter `resourceType=test_account` + `action=deleted` → đúng kết quả.
- [ ] Search "alpha" ở `/projects` → chỉ thấy Project Alpha.
- [ ] SA search "nguyen" ở `/admin/users` → chỉ thấy user có tên/email chứa "nguyen".
- [ ] User mới chưa có dự án → thấy empty state hướng dẫn, không blank screen.
- [ ] Mọi màn hình chính có skeleton khi loading, toast khi network lỗi, error boundary khi crash.
