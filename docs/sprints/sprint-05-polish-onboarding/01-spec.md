# Sprint 05 — History Module + Polish & Onboarding UX · Spec

> **WHAT/WHY** • Status: Draft • Owner: @haidz1004 • Created: 2026-04-25

## Mục tiêu sprint

Sprint 05 tập trung vào **traceability và chất lượng trải nghiệm**:

1. **History Module**: 1 bảng `History` tập trung ghi lại mọi thao tác tạo/sửa/xóa trên các resource quan trọng; filter theo `resourceType` để xem lịch sử của từng loại.
2. **Search & Filter**: tìm kiếm nhanh dự án và user.
3. **UX Polish**: empty state, loading skeleton, error boundary đồng bộ toàn hệ thống; navigation hoàn chỉnh cho SA.

## Out of scope (Phase 2 trở đi)

- Lịch sử cho thao tác "Reveal password" — Phase 2
- Export CSV history — Phase 2
- Realtime notification khi password thay đổi — Phase 2
- Full-text search có ranking — giữ ILIKE đơn giản cho MVP

## Phụ thuộc tiên quyết

- Sprint-01–04 stable: Auth, Project Management, Account Vault, User Management + Env Permission.

---

## Phần A — History Module

### Bối cảnh

Hiện không có cách nào biết ai đã sửa/xóa account test, ai thêm/gỡ member. Một lớp lịch sử tập trung giải quyết:
- Truy vết khi account test bị thay đổi sai.
- Audit khi member bị thêm/gỡ hoặc quyền env thay đổi.
- SA nắm tổng thể mọi biến động trong hệ thống.

### Thiết kế model

```
History
  id:           UUID (PK)
  actorId:      UUID (FK → User, nullable nếu system action)
  action:       ENUM — xem bảng bên dưới
  resourceType: ENUM ('test_account' | 'project' | 'member' | 'user')
  resourceId:   UUID
  resourceName: VARCHAR(255)   -- snapshot tên tại thời điểm ghi
  projectId:    UUID (nullable, FK → Project)
  meta:         JSONB           -- { before?, after } — không lưu password/token
  createdAt:    TIMESTAMP
```

**Action enum theo resourceType**:

| resourceType | action values |
|---|---|
| `test_account` | `created`, `updated`, `deleted` |
| `project` | `created`, `updated`, `archived`, `unarchived` |
| `member` | `added`, `removed`, `env_access_updated` |
| `user` | `created`, `role_changed`, `deactivated` |

### Phân quyền xem history

| Actor | Xem được |
|-------|----------|
| Super Admin | Tất cả (`/admin/history`) |
| Admin (member dự án) | `test_account` + `member` của dự án mình (tab "Lịch sử" trong ProjectDetail) |
| User | Không xem được |

---

### US-22 · Admin / SA xem lịch sử thay đổi trong dự án

> Là **Admin phụ trách dự án hoặc SA**, tôi muốn **xem lịch sử mọi thay đổi trong dự án**, để **truy vết ai sửa/xóa account test hoặc thêm/gỡ member**.

**Acceptance**
- **Given** tôi là Admin (member) hoặc SA
- **When** mở tab "Lịch sử" trong ProjectDetail
- **Then** thấy timeline: actor name, action label (tiếng Việt/Anh), tên resource, thời gian tương đối; có "Load thêm" khi > 20 entry.

**Edge cases**
- Chưa có action nào trong dự án → empty state "Chưa có hoạt động nào".
- User (role user) → **không** thấy tab "Lịch sử".

---

### US-23 · SA xem history toàn hệ thống

> Là **Super Admin**, tôi muốn **xem history toàn bộ hệ thống**, để **giám sát mọi thay đổi trên tất cả dự án và user**.

**Acceptance**
- **Given** tôi là SA, vào `/admin/history`
- **When** trang load
- **Then** thấy bảng history toàn hệ thống; filter được theo `resourceType`, `action`, actor, dự án, date range; phân trang.

**Edge cases**
- Filter kết hợp nhiều chiều cùng lúc → AND logic.
- History rất nhiều → phân trang 20/trang.

---

## Phần B — Search & Filter

### US-24 · Tìm kiếm dự án

> Là **user đã login**, tôi muốn **tìm dự án theo tên hoặc tech stack**, để **nhanh chóng mở dự án cần làm**.

**Acceptance**
- **Given** tôi ở `/projects`
- **When** gõ vào ô tìm kiếm
- **Then** danh sách lọc realtime (debounce 300ms) theo `name`, `techStack`, `partnerName`; case-insensitive.

**Edge cases**
- Không có kết quả → empty state "Không tìm thấy dự án phù hợp với «…»".
- Clear search → trở về toàn bộ danh sách.

---

### US-25 · SA tìm kiếm user

> Là **Super Admin**, tôi muốn **tìm user theo email hoặc tên**, để **nhanh chóng quản lý tài khoản cụ thể**.

**Acceptance**
- **Given** SA ở `/admin/users`
- **When** gõ vào ô tìm kiếm
- **Then** danh sách lọc realtime theo `name`, `email`; kết hợp được với filter role/status.

---

## Phần C — UX Polish

### US-26 · Navigation hoàn chỉnh cho SA

> Là **SA**, tôi muốn thấy link đến các trang quản trị trên sidebar.

**Acceptance**
- Sidebar SA có: "Quản lý User" (`/admin/users`) và "Lịch sử" (`/admin/history`).
- Các link này **không hiện** với role User/Admin.

---

### US-27 · Empty state thân thiện cho user mới

> Là **nhân viên mới chưa được gán dự án**, tôi muốn hiểu tại sao màn hình trống.

**Acceptance**
- Dashboard / Projects trống → hiện text hướng dẫn liên hệ SA/Leader.
- Phân biệt empty state theo role (SA thấy nút tạo dự án; User thấy hướng dẫn liên hệ).

---

### US-28 · Loading và error state nhất quán

**Acceptance**
- Loading: skeleton loader ở Projects và ProjectDetail (không chỉ spinner text).
- Crash: error boundary → page "Có lỗi xảy ra" + nút "Tải lại".
- Network timeout: toast error, không im lặng.

---

## Decision nghiệp vụ

| # | Câu hỏi | Quyết định | Lý do |
|---|---|---|---|
| D-S5-1 | History lưu diff không? | `after` cho created; `{ before, after }` cho updated — không lưu password/token | Đủ để trace mà không lộ sensitive data |
| D-S5-2 | User có quyền xem tab Lịch sử không? | **Không** — chỉ Admin+ | User không cần biết ai sửa gì |
| D-S5-3 | History có endpoint DELETE không? | **Không** — append-only | Toàn vẹn audit |
| D-S5-4 | Search có full-text index không? | **ILIKE đơn giản** — không cần GIN index ở MVP | Dữ liệu nhỏ; thêm sau nếu chậm |
| D-S5-5 | Skeleton hay spinner text? | **Skeleton** cho list/table | Giảm layout shift |

---

## Definition of Done

### Phần A — History Module
- [ ] Mọi action theo bảng enum đều tạo `History` entry sau khi thực hiện
- [ ] Tab "Lịch sử" trong ProjectDetail hiển thị đúng (chỉ Admin+ thấy)
- [ ] `/admin/history` hoạt động đúng với filter đa chiều và phân trang
- [ ] Append-only, không có endpoint DELETE

### Phần B — Search
- [ ] Search dự án theo `name`, `techStack`, `partnerName` (ILIKE)
- [ ] Search user theo `name`, `email` (SA only)
- [ ] Empty state khi không có kết quả; kết hợp được với filter hiện có

### Phần C — UX Polish
- [ ] Sidebar SA có link `/admin/users` và `/admin/history`
- [ ] Empty state đúng theo role ở Dashboard và Projects
- [ ] Skeleton loader ở Projects và ProjectDetail
- [ ] Error boundary bắt crash toàn route
- [ ] Không còn blank screen ở màn hình chính nào
