# Sprint 03 — Test Account Vault · Spec

> **WHAT/WHY** • Status: Draft • Owner: @haidz1004 • Created: 2026-04-20

## Mục tiêu sprint

Mỗi dự án có thể lưu và hiển thị tài khoản test theo 3 môi trường (dev / staging / production). Super Admin và Admin phụ trách dự án quản lý toàn bộ; User chỉ xem và copy thông tin khi cần. Song song đó, FE cập nhật lại UI auth (login/register) và app shell (home/me) theo design mới.

## Out of scope (sprint sau)

- Mã hoá password tại rest (pgcrypto / column-level encryption) — Phase 2
- Mask + reveal-on-demand cho password (hiện `***`, bấm "Reveal" mới decrypt) — Phase 2
- Audit log: ai đã reveal account nào khi nào — Phase 2
- User Management — tạo user, đổi role, deactivate (Sprint 04)
- Search / filter nâng cao (Sprint 05)

## Phụ thuộc tiên quyết

- Sprint-02 hoàn thành: model `Project` + `ProjectMember` + middleware `requireProjectAccess` đã có và stable.
- Membership check (active member) đã đúng — Sprint-03 tái sử dụng để phân quyền account.

---

## User Stories

### US-07 · User xem tài khoản test của dự án

> Là **thành viên của dự án (mọi role)**, tôi muốn **xem danh sách tài khoản test theo từng môi trường**, để **tiện tra cứu khi cần test mà không phải hỏi lại**.

**Acceptance**
- **Given** tôi đã login và là thành viên của dự án X
- **When** vào trang chi tiết dự án X, chọn tab "Tài khoản test"
- **Then** thấy danh sách tài khoản nhóm theo 3 section: Dev / Staging / Production; mỗi tài khoản hiện label, username, password (ẩn mặc định), URL, ghi chú.

**Edge cases**
- Chưa có tài khoản nào trong 1 section → hiện empty state "Chưa có tài khoản dev. Thêm tài khoản mới." (chỉ SA/Admin thấy nút thêm).
- User không thuộc dự án cố truy cập URL trực tiếp → 403, redirect về `/projects`.
- Dự án đã archived → vẫn xem được tài khoản (read-only).

---

### US-08 · Copy thông tin tài khoản test

> Là **thành viên của dự án**, tôi muốn **copy username / password / URL chỉ với 1 click**, để **nhanh chóng điền vào tool test mà không nhìn nhầm**.

**Acceptance**
- **Given** tôi đang xem tab "Tài khoản test"
- **When** click icon copy bên cạnh username, hoặc password, hoặc URL
- **Then** giá trị đó được chép vào clipboard; hiện toast "Đã sao chép" trong 2 giây.

**Edge cases**
- Clipboard API bị từ chối (trình duyệt không có permission) → toast "Không thể sao chép, hãy copy thủ công" + hiện text thuần để select.
- URL trống → nút copy URL disable (không hiển thị icon copy).

---

### US-09 · Super Admin / Admin thêm tài khoản test

> Là **Super Admin hoặc Admin phụ trách dự án**, tôi muốn **thêm tài khoản test mới vào từng môi trường**, để **đội có đủ thông tin để test**.

**Acceptance**
- **Given** tôi là SA hoặc Admin (active member) ở trang chi tiết dự án, tab "Tài khoản test"
- **When** click "+ Thêm tài khoản" → điền label + username + password + môi trường → submit
- **Then** tài khoản mới xuất hiện ở section đúng môi trường.

**Edge cases**
- Label hoặc username hoặc password trống → inline error, không submit.
- URL có nhưng sai format → cảnh báo nhẹ (không chặn), lưu nguyên giá trị.
- Network error → toast "Kết nối thất bại", form giữ nguyên data.

---

### US-10 · Super Admin / Admin sửa tài khoản test

> Là **SA hoặc Admin phụ trách**, tôi muốn **sửa thông tin tài khoản test khi password đổi hoặc URL thay đổi**, để **đội không dùng thông tin lỗi thời**.

**Acceptance**
- **Given** tôi đang xem tab "Tài khoản test"
- **When** click "Sửa" trên 1 tài khoản → thay đổi field → save
- **Then** thông tin mới được lưu, card hiển thị cập nhật.

**Edge cases**
- Sửa bởi Admin nhưng không phải Admin của dự án này → 403.
- Race condition 2 Admin cùng sửa → last-write-wins, không cần lock (xem Decision D5).

---

### US-11 · Super Admin / Admin xóa tài khoản test

> Là **SA hoặc Admin phụ trách**, tôi muốn **xóa tài khoản test không còn dùng**, để **giữ danh sách gọn gàng**.

**Acceptance**
- **Given** tôi đang xem tab "Tài khoản test"
- **When** click "Xóa" → xác nhận modal
- **Then** tài khoản bị xóa khỏi danh sách; hành động không thể hoàn tác.

**Edge cases**
- Tài khoản cuối cùng trong 1 section bị xóa → section hiện empty state.
- User in project cố gọi DELETE → 403.

---

### US-12 · FE — Cập nhật UI Auth (login / register)

> Là **developer**, tôi muốn **cập nhật giao diện trang đăng nhập / đăng ký theo design mới**, để **ứng dụng có UI nhất quán trước sprint-04**.

**Acceptance**
- **Given** design handoff đã có tại `docs/ui-designs/design_handoff_auth/`
- **When** FE implement theo spec trong `README.md` và prototype `Auth.reference.html`
- **Then** AuthLayout chia đôi cột (form trái / brand panel phải), có password strength indicator khi đăng ký, language toggle hiển thị đúng vị trí; validation logic và API call không thay đổi.

**Edge cases**
- Mobile (< 768px): ẩn cột phải, chỉ hiện form.
- Các error state (wrong password, email duplicate) vẫn hiển thị đúng sau khi redesign.

---

### US-13 · FE — Cập nhật UI App Shell (home / profile)

> Là **developer**, tôi muốn **cập nhật AppHeader, HomePage, MePage theo design mới**, để **app shell đồng bộ với design system trước sprint-04**.

**Acceptance**
- **Given** design handoff đã có tại `docs/ui-designs/design_handoff_home_me/`
- **When** FE implement theo spec trong `README.md` và prototype `HomeMe.reference.html`
- **Then** AppHeader có đủ nav links, search placeholder, language toggle, user menu dropdown; HomePage hiện greeting + stats grid + danh sách project/runs; MePage hiện identity strip + info card; sprint-02 pages (projects) không bị regress.

**Edge cases**
- Stats grid trống (user mới, chưa có data) → hiện 0 hoặc empty state nhẹ.
- User menu dropdown: click ra ngoài → đóng lại.

---

## UI Mockup (ASCII)

### Tab "Tài khoản test" trong `/projects/:id`

```
┌────────────────────────────────────────────────────────┐
│ [ Tổng quan ] [ Thành viên (5) ] [ Tài khoản test ]   │
│ ──────────────────────────────────────────────────────│
│                                                        │
│ DEV                              [+ Thêm] (SA/Admin)  │
│ ──────────────────────────────                        │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Admin Portal                                    │   │
│ │ Username: admin_dev          [copy]             │   │
│ │ Password: ••••••••          [copy]             │   │
│ │ URL: https://dev.app.com    [copy]             │   │
│ │ Ghi chú: tài khoản ADMIN đầy đủ quyền         │   │
│ │                              [Sửa] [Xóa]       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                        │
│ STAGING                          [+ Thêm] (SA/Admin)  │
│ ──────────────────────────────                        │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Tester Account                                  │   │
│ │ Username: test_stg           [copy]             │   │
│ │ Password: ••••••••          [copy]             │   │
│ │ URL: https://stg.app.com    [copy]             │   │
│ └─────────────────────────────────────────────────┘   │
│                                                        │
│ PRODUCTION                       [+ Thêm] (SA/Admin)  │
│ ──────────────────────────────                        │
│ (Chưa có tài khoản production)                        │
└────────────────────────────────────────────────────────┘
```

### Modal Thêm / Sửa tài khoản

```
┌─────────────────────────────────────────┐
│ Thêm tài khoản test — PROJECT ALPHA     │
│ ─────────────────────────────────────── │
│ Môi trường *  [ Dev  ▼]                 │
│ Label *       [________________________]│
│ Username *    [________________________]│
│ Password *    [________________] [👁]   │
│ URL           [________________________]│
│ Ghi chú       [________________________]│
│               [________________________]│
│                                         │
│               [ Hủy ]  [ Lưu ]         │
└─────────────────────────────────────────┘
```

---

## API Contract — Test Account Vault

> Base URL: `GET /api/v1` · Auth: `Authorization: Bearer <accessToken>`

### Shared types

```ts
type Environment = 'dev' | 'staging' | 'production';

interface TestAccount {
  id:          string;       // UUID
  projectId:   string;       // UUID
  environment: Environment;
  label:       string;       // max 200
  username:    string;       // max 320
  password:    string;       // plaintext (Phase 1)
  url:         string | null;
  note:        string | null;
  createdBy:   string;       // UUID of creator
  createdAt:   string;       // ISO 8601
  updatedAt:   string;       // ISO 8601
}
```

---

### GET `/projects/:id/accounts`

Trả về tài khoản test của dự án, nhóm theo môi trường.

**Auth**: thành viên của dự án (mọi role) hoặc SUPER_ADMIN.

**Response 200**
```json
{
  "accounts": {
    "dev":        [ /* TestAccount[] */ ],
    "staging":    [ /* TestAccount[] */ ],
    "production": [ /* TestAccount[] */ ]
  }
}
```

**Errors**: `401 UNAUTHORIZED` · `403 FORBIDDEN` (không phải thành viên)

---

### GET `/projects/:id/accounts/:accountId`

Trả về 1 tài khoản test cụ thể.

**Auth**: thành viên của dự án hoặc SUPER_ADMIN.

**Response 200**
```json
{ "account": { /* TestAccount */ } }
```

**Errors**: `401` · `403` · `404 NOT_FOUND`

---

### POST `/projects/:id/accounts`

Tạo tài khoản test mới.

**Auth**: SUPER_ADMIN hoặc thành viên có system role ≥ `admin`.

**Request body**
```json
{
  "environment": "dev",             // required: "dev" | "staging" | "production"
  "label":       "Test Admin",      // required, max 200
  "username":    "admin@dev.local", // required, max 320
  "password":    "Dev@12345",       // required
  "url":         "https://...",     // optional, null nếu bỏ trống
  "note":        "Ghi chú"          // optional
}
```

**Response 201**
```json
{ "account": { /* TestAccount */ } }
```

**Errors**: `400 VALIDATION` (field thiếu / sai type) · `401` · `403`

---

### PATCH `/projects/:id/accounts/:accountId`

Cập nhật tài khoản test (partial update — chỉ gửi field cần sửa).

**Auth**: SUPER_ADMIN hoặc thành viên có system role ≥ `admin`.

**Request body** — tất cả optional
```json
{
  "environment": "staging",
  "label":       "New Label",
  "username":    "new@staging.example",
  "password":    "NewPass@123",
  "url":         "https://staging.example.com",
  "note":        "Updated note"
}
```

**Response 200**
```json
{ "account": { /* TestAccount updated */ } }
```

**Errors**: `400` · `401` · `403` · `404`

---

### DELETE `/projects/:id/accounts/:accountId`

Xóa vĩnh viễn tài khoản test (hard delete — không thể hoàn tác).

**Auth**: SUPER_ADMIN hoặc thành viên có system role ≥ `admin`.

**Response 204** — no body

**Errors**: `401` · `403` · `404`

---

### Error response format

```json
{
  "error": {
    "code":    "FORBIDDEN",
    "message": "Only project admins can modify test accounts"
  },
  "requestId": "uuid"
}
```

| HTTP | code | Khi nào |
|------|------|---------|
| 400  | `VALIDATION` | Body sai schema (field thiếu, sai type, URL không hợp lệ) |
| 401  | `UNAUTHORIZED` | Chưa login / token hết hạn |
| 403  | `FORBIDDEN` | Không phải thành viên, hoặc không đủ role để ghi |
| 404  | `NOT_FOUND` | Project hoặc account không tồn tại |
| 429  | `RATE_LIMIT` | Quá 20 POST requests / phút |

---

### Quyền hạn tổng hợp

| Action | SUPER_ADMIN | Admin (project member) | User (project member) | Non-member |
|--------|:-----------:|:---------------------:|:---------------------:|:----------:|
| List / Get | ✅ | ✅ | ✅ | ❌ 403 |
| Create | ✅ | ✅ | ❌ 403 | ❌ 403 |
| Update | ✅ | ✅ | ❌ 403 | ❌ 403 |
| Delete | ✅ | ✅ | ❌ 403 | ❌ 403 |

> "Admin (project member)" = user có system role `admin` (hoặc cao hơn) VÀ đang là active member của project đó.

---

## Definition of Done

- [ ] Tab "Tài khoản test" hiển thị đúng với cả 3 role: SA thấy + sửa/xóa; Admin-in-project thấy + sửa/xóa; User-in-project chỉ thấy + copy
- [ ] User ngoài project không truy cập được tài khoản test (403 cả BE lẫn FE)
- [ ] Copy-to-clipboard hoạt động trên Chrome/Firefox; có fallback khi clipboard bị từ chối
- [ ] Dự án archived: vẫn xem được tài khoản, không có nút thêm/sửa/xóa
- [ ] Auth UI redesign: layout split, password strength, language toggle đúng
- [ ] App shell redesign: AppHeader, HomePage, MePage theo design; sprint-02 pages không regress
- [ ] Test thủ công đủ US-07 → US-13 với 3 account khác role
- [ ] Không console.log / hardcode string / i18n thiếu key
