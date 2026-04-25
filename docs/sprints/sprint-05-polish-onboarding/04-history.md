# Sprint 05 — History Module + Polish & Onboarding UX · History

> Log mọi thay đổi: task code done, bug fix, quyết định mới. Format: Outcome / Files / Follow-up.

---

## 2026-04-25 · Database Schema Design — Table `histories` (chờ review)

**Outcome**: Thiết kế bảng `histories` để review trước khi implement.

---

### Các table hiện có (tham chiếu)

```
┌─────────────────────────────────────────────┐
│ system_user                                 │
├──────────────┬──────────────┬───────────────┤
│ id           │ UUID         │ PK            │
│ email        │ VARCHAR(320) │ UNIQUE        │
│ name         │ VARCHAR(100) │               │
│ password_hash│ VARCHAR(255) │               │
│ role         │ ENUM         │ super_admin / │
│              │              │ admin / user  │
│ is_active    │ BOOLEAN      │ default true  │
│ created_at   │ TIMESTAMP    │               │
│ updated_at   │ TIMESTAMP    │               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ projects                                    │
├──────────────────────┬────────┬─────────────┤
│ id                   │ UUID   │ PK          │
│ name                 │ VARCHAR(200)          │
│ description          │ TEXT                  │
│ tech_stack           │ TEXT                  │
│ partner_name         │ VARCHAR(200)          │
│ partner_contact_name │ VARCHAR(100)          │
│ partner_email        │ VARCHAR(320)          │
│ partner_phone        │ VARCHAR(30)           │
│ status               │ ENUM   │ active /    │
│                      │        │ archived    │
│ archived_at          │ TIMESTAMP NULL        │
│ created_by           │ UUID   │ FK → user   │
│ created_at           │ TIMESTAMP             │
│ updated_at           │ TIMESTAMP             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ project_members                             │
├──────────────┬───────────────────────────── ┤
│ id           │ UUID         │ PK            │
│ project_id   │ UUID         │ FK → projects │
│ user_id      │ UUID         │ FK → user     │
│ allowed_envs │ TEXT[]       │ ['dev',...]   │
│ added_at     │ TIMESTAMP    │               │
│ removed_at   │ TIMESTAMP NULL               │
│ added_by     │ UUID         │ FK → user     │
│ created_at   │ TIMESTAMP    │               │
│ updated_at   │ TIMESTAMP    │               │
└─────────────────────────────────────────────┘
  Index: (user_id, removed_at)
  Index: (project_id, removed_at)

┌─────────────────────────────────────────────┐
│ test_accounts                               │
├──────────────┬────────────────────────────  ┤
│ id           │ UUID         │ PK            │
│ project_id   │ UUID         │ FK → projects │
│ environment  │ ENUM         │ dev/staging/  │
│              │              │ production    │
│ label        │ VARCHAR(200) │               │
│ username     │ VARCHAR(320) │               │
│ password     │ TEXT         │               │
│ url          │ VARCHAR(500) │ NULL          │
│ note         │ TEXT         │ NULL          │
│ created_by   │ UUID         │ FK → user     │
│ created_at   │ TIMESTAMP    │               │
│ updated_at   │ TIMESTAMP    │               │
└─────────────────────────────────────────────┘
  Index: (project_id, environment)
```

---

### Table mới đề xuất: `histories`

```
┌────────────────────────────────────────────────────────────────────┐
│ histories                                                          │
├───────────────┬───────────────┬──────────────────────────────────  ┤
│ Cột           │ Kiểu          │ Mô tả                              │
├───────────────┼───────────────┼─────────────────────────────────── ┤
│ id            │ UUID          │ PK, default gen_random_uuid()      │
│ actor_id      │ UUID NULL     │ FK → system_user (soft ref*)       │
│ actor_name    │ VARCHAR(100)  │ Snapshot tên lúc ghi — không đổi  │
│               │               │ dù user sau này đổi tên            │
│ actor_email   │ VARCHAR(320)  │ Snapshot email lúc ghi             │
│ action        │ VARCHAR(50)   │ created / updated / deleted /      │
│               │               │ archived / added / role_changed... │
│ resource_type │ ENUM          │ test_account / project /           │
│               │               │ member / user                      │
│ resource_id   │ UUID          │ ID của object bị tác động          │
│ resource_name │ VARCHAR(255)  │ Snapshot tên object lúc ghi        │
│ project_id    │ UUID NULL     │ FK → projects (soft ref*)          │
│ project_name  │ VARCHAR(255)  │ Snapshot tên dự án lúc ghi         │
│ meta          │ JSONB NULL    │ { before?: {...}, after?: {...} }   │
│               │               │ Không lưu password / token         │
│ created_at    │ TIMESTAMP     │ Thời điểm ghi log                  │
└───────────────┴───────────────┴────────────────────────────────────┘
  KHÔNG có updated_at — append-only, không cho phép UPDATE/DELETE row
```

**(*) Soft FK**: `actor_id` và `project_id` không có FOREIGN KEY constraint cứng để tránh lỗi khi user/project bị xóa mềm. Tên đã snapshot vào `actor_name` / `project_name` nên không phụ thuộc FK cho việc đọc.

---

### Indexes đề xuất

| Index | Lý do |
|-------|-------|
| `(resource_type, created_at DESC)` | Filter theo loại + sắp xếp mới nhất trước — query phổ biến nhất |
| `(project_id, created_at DESC)` | Tab "Lịch sử" trong ProjectDetail — query theo dự án |
| `(actor_id, created_at DESC)` | SA filter "ai làm gì" trong `/admin/history` |

---

### Quan hệ với các table hiện có

```
system_user ──────────────────┐
    │                         │
    │ actor_id (soft ref)      │ FK → histories.actor_id
    │                         │
    ▼                         │
histories ◄───────────────────┘
    │
    │ project_id (soft ref)
    │
    ▼
projects

histories.resource_id trỏ đến:
  ├── test_accounts.id   khi resource_type = 'test_account'
  ├── projects.id        khi resource_type = 'project'
  ├── project_members.id khi resource_type = 'member'
  └── system_user.id     khi resource_type = 'user'
  (polymorphic — không có FK constraint)
```

---

### Ví dụ các row thực tế

```
-- Admin sửa password account test
id:            "uuid-1"
actor_id:      "uuid-leader"
actor_name:    "Nguyễn Văn A"
actor_email:   "leader@example.com"
action:        "updated"
resource_type: "test_account"
resource_id:   "uuid-account-staging"
resource_name: "Staging Admin – staging"
project_id:    "uuid-alpha"
project_name:  "Project Alpha"
meta:          { "before": { "label": "Staging Admin", "username": "admin", "url": null },
                 "after":  { "label": "Staging Admin", "username": "admin_v2", "url": "https://stg.app" } }
created_at:    "2026-04-25T10:00:00Z"

-- SA đổi role user
id:            "uuid-2"
actor_id:      "uuid-sa"
actor_name:    "Super Admin"
actor_email:   "admin@example.com"
action:        "role_changed"
resource_type: "user"
resource_id:   "uuid-user"
resource_name: "user@example.com"
project_id:    NULL
project_name:  NULL
meta:          { "before": { "role": "user" }, "after": { "role": "admin" } }
created_at:    "2026-04-25T11:00:00Z"

-- Admin thêm member vào dự án
id:            "uuid-3"
actor_id:      "uuid-leader"
actor_name:    "Nguyễn Văn A"
actor_email:   "leader@example.com"
action:        "added"
resource_type: "member"
resource_id:   "uuid-project-member"
resource_name: "newbie@example.com"
project_id:    "uuid-alpha"
project_name:  "Project Alpha"
meta:          { "after": { "allowedEnvs": ["dev"] } }
created_at:    "2026-04-25T12:00:00Z"
```

---

### Quyết định thiết kế

| # | Quyết định | Lý do |
|---|---|---|
| D1 | Snapshot `actor_name`, `actor_email`, `project_name` vào row | Không phụ thuộc JOIN khi đọc; giữ đúng thông tin tại thời điểm ghi dù sau này đổi tên |
| D2 | Soft FK cho `actor_id`, `project_id` (không constraint cứng) | Tránh lỗi nếu user/project bị soft-delete; tên đã có snapshot |
| D3 | `action` dùng VARCHAR(50) thay vì ENUM | Dễ thêm action mới không cần migration thêm enum value |
| D4 | `resource_id` polymorphic — không FK constraint | 1 bảng history cho nhiều loại resource; FK cứng không thể dùng cho polymorphic |
| D5 | Không có `updated_at`, không expose DELETE endpoint | Append-only để đảm bảo tính toàn vẹn audit |
| D6 | `meta` không lưu `password`, `token`, `permission[]` | Tránh sensitive data trong log |

---

## 2026-04-25 · BE Track A — History Module implement xong (A10–A38)

**Outcome**: History module backend hoàn chỉnh. `histories` table + store + controller + routes. Tất cả mutating action đều ghi history fire-and-forget.

**Files**:
- `src/database/models/History.ts` — Sequelize model, 3 indexes, `updatedAt: false`
- `src/database/models/index.ts` — export `History`
- `src/projects/stores/historyStore.ts` — `append` (fire-and-forget), `listByProject`, `listGlobal`
- `src/projects/schemas/history.schema.ts` — Zod query schema với pagination
- `src/projects/controllers/HistoryController.ts` — `listByProject` (Admin+), `listGlobal` (SA only)
- `src/auth/types.ts` — thêm `projectName?: string` vào Express Request
- `src/projects/middlewares/requireAccountAccess.ts` — attach `req.projectName`
- `src/projects/middlewares/requireProjectAccess.ts` — attach `req.projectName`
- `src/projects/controllers/TestAccountController.ts` — append history: create/update/delete
- `src/projects/controllers/ProjectController.ts` — append history: create/update/archive/unarchive/add_member/remove_member/update_env_access
- `src/auth/controllers/AdminController.ts` — append history: create/change_role/deactivate
- `src/projects/routes.ts` — `GET /projects/:id/history`
- `src/auth/routes.ts` — `GET /admin/history`

**Follow-up**: Migration tạo bảng `histories` user cần chạy thủ công. Track B (search) và Track C (FE) chưa bắt đầu.

---

## 2026-04-25 · BE Track B — Search implement xong (B10–B23)

**Outcome**: ILIKE search cho `GET /projects` (name/techStack/partnerName) và `GET /admin/users` (name/email). Query param `search` tùy chọn, min 1 max 100 ký tự.

**Files**:
- `src/projects/schemas/project.schema.ts` — thêm `search` vào `listProjectsQuerySchema`
- `src/auth/schemas/admin.schema.ts` — thêm `search` vào `listUsersQuerySchema`
- `src/projects/stores/projectStore.ts` — `listForUser` hỗ trợ `Op.iLike` trên name/techStack/partnerName
- `src/auth/stores/userStore.ts` — `listAll` hỗ trợ `Op.iLike` trên name/email
- `src/projects/controllers/ProjectController.ts` — pass `search` xuống store
- `src/auth/controllers/AdminController.ts` — pass `search` xuống store

**Follow-up**: Track C (FE) chưa bắt đầu.

---

**Follow-up** (sau khi review xong):
- [ ] Implement model `History` (Sequelize)
- [ ] Implement `historyStore`: `append()`, `listByProject()`, `listGlobal()`
- [ ] Hook vào controllers: TestAccount, Project, ProjectMember, AdminController
- [ ] Endpoints: `GET /projects/:id/history`, `GET /admin/history`
