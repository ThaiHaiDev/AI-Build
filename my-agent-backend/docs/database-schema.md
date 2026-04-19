# Database Schema — Full Design

> **Tech doc** • Owner: @haidz1004 • Created: 2026-04-19 • Scope: toàn bộ sản phẩm (Sprint 01 → Sprint 05)
>
> Thiết kế schema đủ dùng cho cả 4 sprint phía trước để **tránh migration phá schema về sau**. Mỗi bảng có cột `created_at`/`updated_at` chuẩn Sequelize. Tất cả PK là `UUID v4`.
>
> Nguồn:
> - [docs/product/02-modules.md](../../docs/product/02-modules.md) — business attributes
> - [docs/product/01-personas-and-roles.md](../../docs/product/01-personas-and-roles.md) — permission matrix
> - [docs/sprints/sprint-02-project-management/01-spec.md](../../docs/sprints/sprint-02-project-management/01-spec.md)
> - [docs/sprints/sprint-02-project-management/02-plan.md](../../docs/sprints/sprint-02-project-management/02-plan.md) — 12 decision

---

## Sơ đồ quan hệ (ASCII ERD)

```
┌──────────────────┐             ┌──────────────────────┐
│   system_user    │◄─────┐      │      projects        │
│──────────────────│      │      │──────────────────────│
│ id (PK)          │      │   ┌──│ id (PK)              │
│ email (UNIQUE)   │      │   │  │ name (UNIQUE)        │
│ name             │      │   │  │ description          │
│ password_hash    │      │   │  │ tech_stack           │
│ role             │      │   │  │ partner_*            │
│ is_active        │      │   │  │ status               │
│ created_at       │      │   │  │ archived_at          │
│ updated_at       │      │   │  │ created_by (FK user) │
└──────────────────┘      │   │  │ created_at           │
        ▲                 │   │  │ updated_at           │
        │                 │   │  └──────────────────────┘
        │                 │   │              ▲
        │                 │   │              │
        │          ┌──────┴───▼──────────┐   │
        └──────────│   project_members   │   │
                   │─────────────────────│   │
                   │ id (PK)             │   │
                   │ project_id (FK)  ───┼───┘
                   │ user_id (FK)        │
                   │ added_at            │
                   │ removed_at          │
                   │ added_by (FK user)  │
                   └─────────────────────┘

                   ┌─────────────────────┐
                   │   test_accounts     │
                   │─────────────────────│
                   │ id (PK)             │
                   │ project_id (FK)  ───┼──► projects
                   │ environment (enum)  │
                   │ label               │
                   │ username            │
                   │ password            │
                   │ url                 │
                   │ note                │
                   │ created_by (FK user)│
                   │ created_at          │
                   │ updated_at          │
                   └─────────────────────┘

                   ┌─────────────────────┐
                   │   audit_logs        │ (Sprint-05)
                   │─────────────────────│
                   │ id (PK)             │
                   │ actor_user_id (FK)  │
                   │ action (string)     │
                   │ entity_type         │
                   │ entity_id           │
                   │ metadata (jsonb)    │
                   │ created_at          │
                   └─────────────────────┘
```

---

## 1. `system_user` — đã có từ Sprint 01

Giữ nguyên, **chỉ thêm** field `is_active` (cho Sprint-04 deactivate).

| Cột | Kiểu | Null? | Default | Ghi chú |
|---|---|---|---|---|
| `id` | UUID | ✗ | `uuid_generate_v4()` | PK |
| `email` | VARCHAR(320) | ✗ | — | UNIQUE, lowercase, index |
| `name` | VARCHAR(100) | ✗ | — | — |
| `password_hash` | VARCHAR(255) | ✗ | — | argon2id |
| `role` | ENUM | ✗ | `user` | 7 giá trị: `super_admin`, `admin`, `manager`, `editor`, `user`, `guest`, `anonymous` |
| `is_active` | BOOLEAN | ✗ | `true` | **(mới)** Sprint-04. `false` = deactivated, chặn login |
| `created_at` | TIMESTAMP | ✗ | `NOW()` | — |
| `updated_at` | TIMESTAMP | ✗ | `NOW()` | — |

**Indexes**
- `UNIQUE (email)`
- `INDEX (role)` — filter user theo role ở Sprint-04
- `INDEX (is_active)` — filter user active

**Migration cần**: thêm cột `is_active` trước Sprint-04. Có thể gộp vào migration sprint-02 nếu muốn 1 lần.

---

## 2. `projects`

Dự án của công ty. Chỉ Super Admin được CRUD (theo permission matrix).

| Cột | Kiểu | Null? | Default | Ghi chú |
|---|---|---|---|---|
| `id` | UUID | ✗ | `uuid_generate_v4()` | PK |
| `name` | VARCHAR(200) | ✗ | — | UNIQUE (D5). Trim trước khi save |
| `description` | TEXT | ✓ | NULL | Tối đa ~2000 ký tự (validate FE, BE chỉ giới hạn TEXT) |
| `tech_stack` | TEXT | ✓ | NULL | Free text ban đầu, có thể chuyển `TEXT[]` nếu cần filter (Sprint-05) |
| `partner_name` | VARCHAR(200) | ✓ | NULL | Tên công ty đối tác |
| `partner_contact_name` | VARCHAR(100) | ✓ | NULL | Người liên hệ |
| `partner_email` | VARCHAR(320) | ✓ | NULL | — |
| `partner_phone` | VARCHAR(30) | ✓ | NULL | — |
| `status` | ENUM | ✗ | `active` | `active` \| `archived` |
| `archived_at` | TIMESTAMP | ✓ | NULL | Set khi archive, clear khi un-archive |
| `created_by` | UUID | ✗ | — | FK → `system_user.id`, ON DELETE RESTRICT |
| `created_at` | TIMESTAMP | ✗ | `NOW()` | — |
| `updated_at` | TIMESTAMP | ✗ | `NOW()` | — |

**Indexes**
- `UNIQUE (LOWER(name))` — không cho trùng tên bất kể case
- `INDEX (status)` — filter archived
- `INDEX (created_by)`

**Notes**
- **Không hard delete** (D2). Xóa = set `status='archived'` + `archived_at=NOW()`.
- `description` + `tech_stack` dùng `TEXT` để không giới hạn cứng.
- **Không** có cột `code` ngắn (D6 — hoãn, phase 2 nếu cần thêm).

---

## 3. `project_members` — M2M user ↔ project với soft remove

Giữ lịch sử membership đầy đủ (D3).

| Cột | Kiểu | Null? | Default | Ghi chú |
|---|---|---|---|---|
| `id` | UUID | ✗ | `uuid_generate_v4()` | PK |
| `project_id` | UUID | ✗ | — | FK → `projects.id`, ON DELETE RESTRICT |
| `user_id` | UUID | ✗ | — | FK → `system_user.id`, ON DELETE RESTRICT |
| `added_at` | TIMESTAMP | ✗ | `NOW()` | — |
| `removed_at` | TIMESTAMP | ✓ | NULL | NULL = đang là member; set khi gỡ |
| `added_by` | UUID | ✗ | — | FK → `system_user.id`. Super Admin thực hiện |
| `created_at` | TIMESTAMP | ✗ | `NOW()` | Sequelize default |
| `updated_at` | TIMESTAMP | ✗ | `NOW()` | — |

**Indexes**
- `UNIQUE (project_id, user_id) WHERE removed_at IS NULL` — **partial unique index**, đảm bảo 1 user chỉ active 1 lần trong 1 project, nhưng cho phép re-add sau khi remove
- `INDEX (user_id, removed_at)` — query "dự án user đang active" ở `GET /projects`
- `INDEX (project_id, removed_at)` — query "member của project"

**Notes**
- Gỡ = set `removed_at=NOW()`, KHÔNG delete row. Re-add = tạo row mới (lịch sử giữ).
- Super Admin **không cần** là member để xem (D4) — query sẽ check role trước membership.

---

## 4. `test_accounts` — Sprint-03

Account test của dự án theo 3 môi trường. Password **plaintext** phase 1 (quyết định trong [00-vision.md Known risks](../../docs/product/00-vision.md)).

| Cột | Kiểu | Null? | Default | Ghi chú |
|---|---|---|---|---|
| `id` | UUID | ✗ | `uuid_generate_v4()` | PK |
| `project_id` | UUID | ✗ | — | FK → `projects.id`, ON DELETE CASCADE |
| `environment` | ENUM | ✗ | — | `dev` \| `staging` \| `production` |
| `label` | VARCHAR(200) | ✗ | — | Vd "QC account 1", "Admin demo" |
| `username` | VARCHAR(320) | ✗ | — | Email hoặc username |
| `password` | TEXT | ✗ | — | **Plaintext phase 1**. Phase 2: encrypted |
| `url` | VARCHAR(500) | ✓ | NULL | URL môi trường |
| `note` | TEXT | ✓ | NULL | Ghi chú thêm |
| `created_by` | UUID | ✗ | — | FK → `system_user.id` |
| `created_at` | TIMESTAMP | ✗ | `NOW()` | — |
| `updated_at` | TIMESTAMP | ✗ | `NOW()` | — |

**Indexes**
- `INDEX (project_id, environment)` — list account theo project + env

**Notes**
- `ON DELETE CASCADE` từ projects: nhưng vì projects không hard delete (chỉ archive) → cascade thực tế không bao giờ trigger. Vẫn để đúng semantic.
- **Phase 2 migration**: đổi `password` từ `TEXT` plaintext sang `BYTEA` encrypted (pgcrypto) hoặc giữ `TEXT` + encrypt ở application layer.
- **Không giới hạn** số account/env/project (xem 02-modules.md Module 2).

---

## 5. `audit_logs` — Sprint-05

Ghi CRUD action (tạo/sửa/xóa project, add/remove member, edit test account). **Chưa ghi** view action (phase 2).

| Cột | Kiểu | Null? | Default | Ghi chú |
|---|---|---|---|---|
| `id` | UUID | ✗ | `uuid_generate_v4()` | PK |
| `actor_user_id` | UUID | ✗ | — | FK → `system_user.id`. Ai làm action |
| `action` | VARCHAR(50) | ✗ | — | Vd `project.create`, `project.archive`, `project_member.add`, `project_member.remove`, `test_account.update` |
| `entity_type` | VARCHAR(50) | ✗ | — | `project` \| `project_member` \| `test_account` \| `user` |
| `entity_id` | UUID | ✓ | NULL | ID của entity bị tác động |
| `metadata` | JSONB | ✓ | NULL | Payload tự do: diff, old/new values, context |
| `created_at` | TIMESTAMP | ✗ | `NOW()` | — |

**Indexes**
- `INDEX (actor_user_id, created_at DESC)` — xem hoạt động của 1 user
- `INDEX (entity_type, entity_id, created_at DESC)` — lịch sử 1 entity
- `INDEX (created_at DESC)` — feed activity chung

**Notes**
- Append-only: không bao giờ UPDATE/DELETE. Retention policy tuỳ compliance (có thể chuyển cold storage sau N tháng, phase 2).

---

## Thứ tự migration theo sprint

| Sprint | Migrations |
|---|---|
| **01** (done) | `system_user` đã có |
| **02** | `add_is_active_to_system_user`, `create_projects`, `create_project_members` |
| **03** | `create_test_accounts` |
| **04** | (không schema change — chỉ dùng `is_active` đã thêm ở Sprint-02) |
| **05** | `create_audit_logs` |
| **Phase 2** | `encrypt_test_account_password`, indices mở rộng nếu cần |

Gộp `add_is_active_to_system_user` vào Sprint-02 để tránh 1 migration lẻ ở Sprint-04.

---

## Naming conventions (đã áp dụng)

- Table name: snake_case, **số ít** cho bảng có prefix domain (`system_user`) và số nhiều cho bảng entity thường (`projects`, `test_accounts`, `project_members`, `audit_logs`). Giữ nguyên tableName `system_user` của model hiện tại.
- Column: snake_case ở DB, camelCase ở model (Sequelize `underscored: true`).
- FK: `<entity>_id` (vd `project_id`, `user_id`).
- Timestamp: `created_at`, `updated_at`, `archived_at`, `added_at`, `removed_at` — luôn có hậu tố `_at`.
- Enum: lowercase (`active`, `archived`, `dev`, `staging`, `production`).
- PK: luôn UUID v4, không dùng auto-increment int.

---

## Constraints & validations tổng hợp

| Constraint | Lý do |
|---|---|
| `projects.name` unique (case-insensitive) | D5 — không cho trùng tên |
| `project_members` partial unique | Cho phép re-add sau remove |
| `system_user.email` unique, lowercase | Đã có từ Sprint-01 |
| FK `ON DELETE RESTRICT` | Bảo vệ toàn vẹn, không hard delete lan truyền |
| FK `ON DELETE CASCADE` chỉ trên `test_accounts → projects` | Nếu tương lai cần xóa hẳn project |
| `status` enum thay vì boolean | Mở rộng sau (vd thêm `draft`, `paused`) |

---

## Câu hỏi mở liên quan schema

- **Project code ngắn** (`PRJ-ABC`): nếu thêm → cần cột `code VARCHAR(10) UNIQUE`. Hoãn đến khi team confirm.
- **Tech stack filter** (Sprint-05): nếu cần query "dự án nào dùng React" → đổi `tech_stack` từ `TEXT` sang `TEXT[]` + GIN index. Migration không đau nếu phát hiện sớm.
- **Test account sorting**: có cần `sort_order` để user tự sắp xếp account trong 1 env không? Hiện tại chưa có — order theo `created_at`.
