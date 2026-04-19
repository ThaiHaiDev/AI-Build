# Sprint 02 — Project Management · Tasks

> **Atomic checklist** • Status: Draft • Updated: 2026-04-19
> Mỗi task ≤ 30–60 phút. Tick `[x]` khi xong. Liên kết commit ở `04-history.md`.
> Task BE và FE tách riêng để thực hiện song song.

---

## 🐛 Pre-sprint — Fix sprint-01 bug tồn đọng

Bắt buộc fix trước khi vào task chính vì permission gating phụ thuộc.

### BE

- [x] **B00** · Tạo serializer `toPublicUser(user)` trả về đúng shape `{ id, email, name, role, permissions, createdAt }`. Source: [bugs/be-auth-contract-gaps.md](../sprint-01-auth-ui/bugs/be-auth-contract-gaps.md)
- [x] **B01** · Build `permissions` từ role → permission mapping (BE là source of truth, dùng lại hierarchy đã có trong `auth/constants.ts`)
- [x] **B02** · Sửa `POST /api/v1/auth/register` dùng `toPublicUser`, response `{ user, accessToken }`
- [x] **B03** · Sửa `POST /api/v1/auth/login` dùng `toPublicUser`
- [x] **B04** · Sửa `GET /api/v1/auth/me` dùng `toPublicUser`, **xóa `jti` khỏi response**
- [ ] **B05** · Integration test: assert user có 6 field + assert không có `jti`, `passwordHash`, `password`, `refreshToken` rò rỉ ở 3 endpoint
- [ ] **B06** · Update README/API docs (nếu có) — contract mới

### FE

- [x] **F00** · Sau khi BE fix xong → revert workaround trong `auth.types.ts`: `name`, `createdAt`, `permissions` chuyển về required
- [x] **F01** · Render đầy đủ `name`, `createdAt` ở `/me`
- [x] **F02** · Enable `useHasPermission` hook — verify hoạt động đúng với `permissions` từ BE

---

## 🔧 BE — Project Management API

### Foundation

- [x] **B10** · Tạo model `Project` (tên, mô tả, tech stack, thông tin đối tác, trạng thái active/archived, timestamps) + migration
- [x] **B11** · Tạo model `ProjectMember` (many-to-many user ↔ project, lưu `addedAt`, `removedAt` cho soft remove) + migration
- [x] **B12** · Seed 2 dự án demo + gán sẵn `admin@example.com` và `user@example.com` (cho dev test)
- [x] **B13** · Tạo `projectStore` / service layer: `create`, `update`, `archive`, `unarchive`, `findById`, `listForUser(userId, role)`, `addMember`, `removeMember`
- [x] **B14** · Middleware `requireProjectAccess(projectId)`: check role=SUPER_ADMIN OR membership active

### Endpoints (versioned `/api/v1`)

- [x] **B20** · `POST /projects` — Super Admin tạo dự án (validate tên unique, không rỗng)
- [x] **B21** · `GET /projects` — List dự án theo rule visibility (SA: all, others: assigned only); query param `?includeArchived=1` để bật archived
- [x] **B22** · `GET /projects/:id` — Chi tiết dự án (áp `requireProjectAccess`)
- [x] **B23** · `PATCH /projects/:id` — Sửa dự án (Super Admin only, chặn nếu archived)
- [x] **B24** · `POST /projects/:id/archive` — Archive dự án (Super Admin only)
- [x] **B25** · `POST /projects/:id/unarchive` — Un-archive (Super Admin only)
- [x] **B26** · `GET /projects/:id/members` — List member của dự án (áp `requireProjectAccess`)
- [x] **B27** · `POST /projects/:id/members` — Thêm member (Super Admin only, validate user tồn tại & chưa là member active)
- [x] **B28** · `DELETE /projects/:id/members/:userId` — Gỡ member (soft remove, set `removedAt`)
- [x] **B29** · `GET /users?search=<q>` — Search user theo email/tên cho modal thêm member (Super Admin only)

### Error handling & security

- [x] **B30** · Tất cả endpoint dùng `asyncHandler` + throw `AppError` subclass (không `throw new Error`)
- [x] **B31** · Tên dự án trùng → `ConflictError`, trả message `project.name.duplicate`
- [x] **B32** · User không phải member & không phải SA truy cập `/projects/:id` → 403 `ForbiddenError`
- [x] **B33** · Rate limit cho `POST /projects` & `POST /projects/:id/members` (tránh abuse)

### Testing

- [ ] **B40** · Integration test `POST /projects`: success + duplicate name + non-SA forbidden
- [ ] **B41** · Integration test visibility `GET /projects`: SA thấy all, USER chỉ thấy assigned
- [ ] **B42** · Integration test membership: add → user thấy project; remove → request kế tiếp 403
- [ ] **B43** · Integration test archive: archived project ẩn mặc định, hiện với `?includeArchived=1`; archived không edit được (400)
- [ ] **B44** · Integration test không dùng mock DB — hit Postgres thật local `aiTest` (theo CLAUDE.md rule)

---

## 🎨 FE — Project Management UI

### Foundation

- [x] **F10** · Thêm i18n namespace `projects` VN/EN, đủ key cho tất cả string trong spec
- [x] **F20** · Service layer `projectService.ts`: wrap tất cả endpoint B20–B29, type-safe với response BE mới
- [x] **F21** · State management cho list project + chi tiết (Zustand hoặc TanStack Query theo pattern sprint-01)
- [x] **F22** · Route setup: `/projects`, `/projects/:id` — đều là protected route (redirect login nếu chưa auth)

### US-05 · List dự án (tất cả role)

- [x] **F30** · Page `/projects` layout theo mockup
- [x] **F31** · Component `ProjectCard`: tên, mô tả ngắn, stack, số member, badge trạng thái
- [x] **F32** · Filter "Xem dự án đã archive" (checkbox, gọi API với `?includeArchived=1`)
- [x] **F33** · Search box filter theo tên (client-side, không gọi API nếu list < 50)
- [x] **F34** · Empty state: "Bạn chưa thuộc dự án nào. Liên hệ PM/Leader để được add."
- [x] **F35** · Nút "Tạo dự án" chỉ hiện khi `useHasPermission('project:write')` hoặc role=SUPER_ADMIN

### US-01 · Tạo dự án (Super Admin)

- [x] **F40** · Modal/Page tạo dự án với `react-hook-form` + Zod resolver
- [x] **F41** · Field: tên (required, 1–200 ký tự), mô tả (optional, max 2000), tech stack (tag input hoặc textarea), đối tác (tên, contact, email, phone — optional)
- [x] **F42** · Wire submit → `projectService.create` → close modal → refresh list → toast success
- [x] **F43** · Handle lỗi: 409 duplicate name → inline error field tên; network → toast

### US-06 · Chi tiết dự án

- [x] **F50** · Page `/projects/:id` layout theo mockup với 2 tab: "Tổng quan" / "Thành viên"
- [x] **F51** · Tab Tổng quan: hiển thị mô tả, stack, đối tác
- [x] **F52** · Handle 403: redirect `/projects` + toast "Không có quyền xem dự án này"
- [x] **F53** · Handle 404: page NotFound riêng
- [x] **F54** · Badge "Đã archive" nếu `status === 'archived'`

### US-02 · Sửa dự án (Super Admin)

- [x] **F60** · Nút "Sửa" chỉ hiện cho Super Admin, disable nếu archived
- [x] **F61** · Modal sửa dùng lại form tạo, pre-fill data
- [x] **F62** · Wire submit → `projectService.update` → refresh detail → toast

### US-03 · Archive / Un-archive

- [x] **F70** · Nút "Archive" / "Khôi phục" — chỉ Super Admin
- [x] **F71** · Confirm modal trước khi archive ("Dự án sẽ bị ẩn khỏi danh sách mặc định. Tiếp tục?")
- [x] **F72** · Wire → `projectService.archive|unarchive` → refresh → toast

### US-04 · Gán / gỡ member

- [x] **F80** · Tab "Thành viên": list member với email, tên, role, nút gỡ (Super Admin)
- [x] **F81** · Nút "+ Thêm thành viên" mở modal search user (chỉ Super Admin)
- [x] **F82** · Modal search: debounce input → gọi `GET /users?search=` → show kết quả, disable user đã là member
- [x] **F83** · Wire add → `projectService.addMember` → refresh list member + toast
- [x] **F84** · Nút "×" gỡ member: confirm modal → `projectService.removeMember` → refresh + toast
- [x] **F85** · Handle trường hợp user đang xem tab Thành viên → bị gỡ khỏi project (bởi người khác) → request kế tiếp 403 → redirect

### Permission gating

- [x] **F90** · Mọi action button (tạo, sửa, archive, thêm/gỡ member) đều qua `useHasPermission` hoặc check role, không chỉ ẩn UI mà còn BE chặn (defense in depth)
- [x] **F91** · `ProtectedRoute` cho `/projects/*` — chưa login redirect `/login?redirect=<path>`

### Polish

- [x] **F95** · Responsive 3 breakpoint (mobile / tablet / desktop)
- [x] **F96** · A11y: label, aria, focus, keyboard navigation cho form + modal
- [x] **F97** · Loading state + error state cho list, detail, modal
- [x] **F98** · Cleanup: xóa `console.log`, verify i18n không hardcode

---

## 🧪 QA / Test thủ công

- [ ] **Q01** · Với tài khoản Super Admin: chạy đủ US-01 → US-04, verify list/detail/archive/un-archive
- [ ] **Q02** · Với Admin: chỉ thấy dự án được add, không thấy nút tạo/sửa/archive, không thấy dự án khác
- [ ] **Q03** · Với User: tương tự Admin, không có nút gì ngoài xem
- [ ] **Q04** · Test real-time gỡ member: User đang ở tab Thành viên, Super Admin gỡ user ở browser khác → User click refresh → 403 → redirect
- [ ] **Q05** · Test URL trực tiếp: copy URL `/projects/:id` gửi cho user khác không thuộc → 403
- [ ] **Q06** · Test 2 tab logout (đã test sprint-01, verify không regress)
- [ ] **Q07** · Verify BE-BUG-01 fix: `/me` không còn `jti`, có đủ `name`, `createdAt`, `permissions`

---

## Sprint close

- [ ] **C01** · Update `04-history.md` với summary + các commit liên quan
- [ ] **C02** · Review DoD ở `01-spec.md` — tick hết
- [ ] **C03** · Tag git `sprint-02-project-management-done`
- [ ] **C04** · Ghi bugs phát sinh (nếu có) vào `bugs/` của sprint 02
- [ ] **C05** · Close bug `be-auth-contract-gaps.md` (đánh dấu FIXED)
