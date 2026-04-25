# Sprint 04 — User Management · Spec

> **WHAT/WHY** • Status: Draft • Owner: @haidz1004 • Created: 2026-04-25

## Mục tiêu sprint

Sprint 04 gồm hai nhóm việc song song:

1. **User Management**: Super Admin quản lý toàn bộ user trong hệ thống (tạo, đổi role, deactivate).
2. **Env-level Permission cho Account Vault**: kiểm soát từng member trong dự án chỉ xem được môi trường nào (dev / staging / production) thay vì luôn thấy hết cả 3.

## Out of scope (sprint sau)

- Encryption at rest cho password account test — Phase 2
- Mask + reveal-on-demand — Phase 2
- Audit log nâng cao (ai reveal tài khoản nào) — Phase 2
- SSO / Invite flow qua email — Phase 2
- Search / filter nâng cao — Sprint 05

## Phụ thuộc tiên quyết

- Sprint-02 stable: `Project`, `ProjectMember` model + `requireProjectAccess` middleware.
- Sprint-03 stable: `TestAccount` model + `requireAccountAccess` middleware (Sprint 04 sẽ mở rộng middleware này để filter theo env).

---

## Phần A — User Management

### US-14 · Super Admin xem danh sách user

> Là **Super Admin**, tôi muốn **xem toàn bộ danh sách user**, để **biết ai đang có tài khoản trong hệ thống**.

**Acceptance**
- **Given** tôi là SA, vào trang `/admin/users`
- **When** trang load
- **Then** thấy danh sách user: avatar, tên, email, role, trạng thái (active / deactivated), ngày tạo; có thể filter theo role hoặc trạng thái.

---

### US-15 · Super Admin tạo user mới

> Là **Super Admin**, tôi muốn **tạo tài khoản cho nhân viên mới**, để **họ có thể đăng nhập ngay mà không cần tự đăng ký**.

**Acceptance**
- **Given** tôi là SA ở `/admin/users`
- **When** click "+ Tạo user" → điền email, tên, mật khẩu tạm, role → submit
- **Then** user mới xuất hiện trong danh sách; có thể đăng nhập ngay bằng thông tin vừa tạo.

**Edge cases**
- Email đã tồn tại → inline error "Email đã được dùng".
- Password không đủ strength → inline error.

---

### US-16 · Super Admin đổi role user

> Là **Super Admin**, tôi muốn **thay đổi role của user**, để **cấp hoặc thu hồi quyền Admin**.

**Acceptance**
- **Given** tôi là SA, đang xem chi tiết 1 user
- **When** đổi role → confirm → save
- **Then** user đó đăng nhập lại (hoặc refresh token) thấy quyền mới.

**Edge cases**
- SA không thể đổi role của chính mình để tránh tự lock out.
- Đổi Admin → User nhưng user đang là Admin duy nhất của 1 project → cảnh báo (không chặn).

---

### US-17 · Super Admin deactivate user

> Là **Super Admin**, tôi muốn **deactivate user**, để **ngăn tài khoản bị lộ hoặc nhân viên nghỉ việc vẫn còn truy cập**.

**Acceptance**
- **Given** tôi là SA
- **When** deactivate 1 user → confirm
- **Then** user đó bị logout forced khỏi mọi phiên; không đăng nhập lại được; dữ liệu membership giữ nguyên (soft deactivate).

**Edge cases**
- SA deactivate chính mình → blocked, hiện cảnh báo.
- User deactivated cố refresh token → 401, logout FE.

---

### US-18 · User xem và sửa thông tin cá nhân

> Là **user đăng nhập**, tôi muốn **xem và cập nhật tên + đổi password**, để **giữ thông tin chính xác**.

**Acceptance**
- **Given** tôi đang ở `/me`
- **When** sửa tên → save / hoặc đổi password (nhập password cũ + mới + confirm)
- **Then** thông tin cập nhật; đổi password thành công không logout phiên hiện tại.

**Edge cases**
- Password cũ sai → inline error "Mật khẩu hiện tại không đúng".
- Password mới trùng password cũ → cảnh báo nhẹ (không chặn).

---

## Phần B — Env-Level Permission cho Account Vault

### Bối cảnh

Sprint-03 implement Account Vault với phân quyền theo **project membership + role**. Kết quả: member được add vào project → thấy **tất cả 3 môi trường** (dev/staging/production).

**Vấn đề**: tài khoản production thường nhạy cảm hơn dev/staging. Không phải mọi member đều cần xem production.

**Giải pháp**: thêm cột `allowedEnvs` vào `ProjectMember` — mỗi member có danh sách môi trường riêng được phép xem trong project đó.

---

### Thiết kế dữ liệu

```
ProjectMember
  + allowedEnvs: ARRAY<enum('dev','staging','production')>
                 DEFAULT ['dev']          -- mặc định chỉ dev khi add mới
```

**Lý do default `['dev']`**: principle of least privilege — production cần grant thêm chủ động, không tự nhiên có.

---

### Quy tắc nghiệp vụ

| Actor | Môi trường được xem/thao tác |
|-------|------------------------------|
| SUPER_ADMIN | Luôn là tất cả (không bị giới hạn bởi `allowedEnvs`) |
| Admin (active member) | Chỉ các env trong `allowedEnvs` của mình trong project đó |
| User (active member) | Chỉ các env trong `allowedEnvs` của mình trong project đó |
| Non-member | 403 (không thay đổi) |

**Khi thao tác ghi (Create/Update/Delete)**:
- Admin muốn thêm account vào env X → X phải nằm trong `allowedEnvs` của họ.
- Nếu không → 403 `ENV_ACCESS_FORBIDDEN`.

---

### US-19 · SA / Admin gán env access khi thêm member

> Là **Super Admin hoặc Admin phụ trách dự án**, tôi muốn **chọn môi trường nào member được xem khi thêm họ vào dự án**, để **production chỉ mở khi thực sự cần**.

**Acceptance**
- **Given** tôi đang thêm member vào dự án
- **When** chọn user → chọn role → chọn môi trường được xem (checkbox: Dev / Staging / Production; default chỉ tick Dev) → confirm
- **Then** member được add với `allowedEnvs` tương ứng; khi họ vào tab Tài khoản test chỉ thấy section của env được cấp.

**Edge cases**
- Không tick env nào → cảnh báo "Phải chọn ít nhất 1 môi trường".
- SA thêm member → SA có thể tick cả 3 env.
- Admin thêm member → Admin chỉ grant tối đa những env mình đang có (`allowedEnvs` của Admin ≤ `allowedEnvs` admin đang có). Không thể grant quyền vượt quá mình.

---

### US-20 · SA / Admin chỉnh sửa env access của member hiện tại

> Là **Super Admin hoặc Admin phụ trách dự án**, tôi muốn **thay đổi env access của member đang có trong dự án**, để **điều chỉnh khi trách nhiệm của họ thay đổi**.

**Acceptance**
- **Given** tôi đang xem danh sách member của dự án
- **When** click "Sửa quyền" của 1 member → chỉnh checkbox env → save
- **Then** lần sau member đó vào tab Tài khoản test → chỉ thấy env được cấp mới.

**Edge cases**
- Thu hồi env X của member đang đứng ở tab và có card thuộc env X → card đó ẩn ngay ở lần load tiếp theo (không force reload realtime, chấp nhận stale 1 request).
- Admin chỉnh env access của member khác không được vượt `allowedEnvs` của chính Admin.

---

### US-21 · Member chỉ thấy section env mình có quyền

> Là **member có `allowedEnvs = ['dev', 'staging']`**, khi vào tab Tài khoản test, tôi chỉ thấy section Dev và Staging — **không thấy section Production**.

**Acceptance**
- **Given** tôi là member, `allowedEnvs = ['dev']`
- **When** vào tab "Tài khoản test"
- **Then** chỉ thấy section Dev; section Staging và Production không xuất hiện (ẩn hoàn toàn, không hiện "bạn không có quyền").

**Edge cases**
- `allowedEnvs = []` (edge case không hợp lệ, bị validate khi save) → hiện tất cả rỗng + thông báo "Liên hệ Admin để cấp quyền xem môi trường".
- SA xem luôn thấy đủ cả 3 section dù cột `allowedEnvs` lưu gì.

---

### API Contract — Env Access

#### PATCH `/projects/:id/members/:memberId/env-access`

Cập nhật danh sách môi trường được phép của 1 member trong project.

**Auth**: SUPER_ADMIN hoặc Admin active member của project.

**Request body**
```json
{
  "allowedEnvs": ["dev", "staging"]
}
```

**Business rules**:
- `allowedEnvs` phải là subset của `['dev', 'staging', 'production']`.
- `allowedEnvs` không được rỗng.
- Admin chỉ có thể grant các env nằm trong `allowedEnvs` của chính họ.

**Response 200**
```json
{
  "member": {
    "userId":      "uuid",
    "projectId":   "uuid",
    "role":        "user",
    "allowedEnvs": ["dev", "staging"],
    "updatedAt":   "2026-04-25T10:00:00Z"
  }
}
```

**Errors**
| HTTP | code | Khi nào |
|------|------|---------|
| 400  | `VALIDATION` | `allowedEnvs` rỗng hoặc chứa giá trị ngoài enum |
| 403  | `FORBIDDEN` | Không phải SA/Admin của project |
| 403  | `ENV_ACCESS_FORBIDDEN` | Admin cố grant env vượt quá quyền của mình |
| 404  | `NOT_FOUND` | Member không thuộc project |

---

#### GET `/projects/:id/accounts` — cập nhật filter theo env

Response trả về chỉ các env trong `allowedEnvs` của người gọi:

```json
{
  "accounts": {
    "dev":     [ /* TestAccount[] */ ],
    "staging": [ /* TestAccount[] */ ]
    // "production" không xuất hiện nếu không có quyền
  },
  "grantedEnvs": ["dev", "staging"]
}
```

Thêm field `grantedEnvs` để FE biết tại sao section production không có (không phải empty mà là không có quyền).

---

### Permission matrix (cập nhật từ Sprint-03)

| Action | SUPER_ADMIN | Admin (member) | User (member) | Non-member |
|--------|:-----------:|:--------------:|:-------------:|:----------:|
| List / Get | ✅ all envs | ✅ `allowedEnvs` only | ✅ `allowedEnvs` only | ❌ 403 |
| Create | ✅ any env | ✅ trong `allowedEnvs` | ❌ 403 | ❌ 403 |
| Update | ✅ any env | ✅ trong `allowedEnvs` | ❌ 403 | ❌ 403 |
| Delete | ✅ any env | ✅ trong `allowedEnvs` | ❌ 403 | ❌ 403 |
| Set `allowedEnvs` | ✅ | ✅ (không vượt env của mình) | ❌ 403 | ❌ 403 |

---

### Permission flow (cập nhật)

```
Request vào /projects/:id/accounts
    │
    ▼ Auth check
    │
    ├── SUPER_ADMIN? → trả về tất cả 3 env
    │
    └── Active member?
          ├── [No] → 403
          └── [Yes] → lấy allowedEnvs của member này trong project
                        │
                        ▼
                   Filter accounts theo allowedEnvs
                        │
                        ▼
                   Check role cho ghi (Create/Update/Delete)
                        ├── ADMIN → cho phép (trong phạm vi allowedEnvs)
                        └── USER  → chỉ đọc (trong phạm vi allowedEnvs)
```

---

### Decision nghiệp vụ

| # | Câu hỏi | Quyết định | Lý do |
|---|---|---|---|
| D-ENV-1 | Default `allowedEnvs` khi add member? | `['dev']` | Principle of least privilege; production cần chủ động grant |
| D-ENV-2 | Section env bị ẩn hay hiện "bạn không có quyền"? | **Ẩn hoàn toàn** | UX tốt hơn; tránh để user biết tồn tại account production khi họ không có quyền |
| D-ENV-3 | Admin có grant env vượt quá `allowedEnvs` của mình không? | **Không** | Tránh privilege escalation; SA mới có thể grant full |
| D-ENV-4 | SA có `allowedEnvs` trong DB không? | **Không cần** — SA bypass kiểm tra env | Đơn giản hóa model; SA không bị ràng buộc bởi column này |
| D-ENV-5 | Thay đổi `allowedEnvs` có hiệu lực ngay không? | **Có ở request kế tiếp** (không force realtime) | Không cần WebSocket; đủ cho MVP |

---

## Definition of Done

### Phần A — User Management
- [ ] SA xem được danh sách toàn bộ user, filter theo role / trạng thái
- [ ] SA tạo user mới với role chỉ định; user mới đăng nhập được ngay
- [ ] SA đổi role: quyền mới có hiệu lực sau khi user refresh token
- [ ] SA deactivate user: user bị logout forced, không login lại được
- [ ] User tự sửa tên + đổi password thành công
- [ ] SA không thể deactivate / đổi role chính mình

### Phần B — Env-Level Permission
- [ ] Migration thêm cột `allowedEnvs` vào `ProjectMember`; default `['dev']`
- [ ] `GET /projects/:id/accounts` trả về đúng env theo `allowedEnvs` của người gọi
- [ ] Section env không trong `allowedEnvs` không xuất hiện trên FE
- [ ] SA luôn thấy đủ 3 section bất kể `allowedEnvs`
- [ ] `PATCH /projects/:id/members/:memberId/env-access` hoạt động đúng, Admin không grant vượt quyền
- [ ] Checkbox env hiển thị khi thêm member / sửa quyền member
- [ ] Integration test: member `allowedEnvs=['dev']` gọi GET → không thấy staging/production accounts
- [ ] Integration test: Admin cố grant env mình không có → 403
