# Sprint 01 — Auth UI · Spec

> **WHAT/WHY** • Status: Draft • Owner: @haidz1004 • Created: 2026-04-18

## Mục tiêu sprint

Triển khai luồng auth end-to-end ở FE để user có thể: đăng ký tài khoản mới, đăng nhập, xem profile của mình, đăng xuất. Backend đã sẵn sàng tại `http://localhost:8000/api/auth/*`.

## Out of scope (sprint sau)

- Forgot password / reset password flow
- 2FA / OTP
- Email verification
- Profile edit (chỉ view ở sprint này)
- Admin user management

---

## User Stories

### US-01 · Register

> Là **khách (anonymous)**, tôi muốn **tạo tài khoản mới bằng email + password**, để **truy cập các tính năng dành cho user đã đăng nhập**.

**Acceptance**
- **Given** tôi đang ở `/register` chưa đăng nhập
- **When** tôi nhập email hợp lệ + name + password đạt yêu cầu + click "Đăng ký"
- **Then** tài khoản được tạo, tôi được auto-login (access token lưu memory, refresh token lưu cookie httpOnly), redirect về `/me`.

**Edge cases**
- Email đã tồn tại → toast lỗi "Email đã được sử dụng", form không reset.
- Password yếu → inline error dưới field, submit button disabled.
- Network error → toast "Kết nối thất bại, thử lại".
- Đang submit → button "Đang xử lý..." + disabled.

### US-02 · Login

> Là **user đã có tài khoản**, tôi muốn **đăng nhập bằng email + password**, để **truy cập tài khoản của mình**.

**Acceptance**
- **Given** tôi ở `/login` chưa đăng nhập
- **When** tôi nhập email + password đúng + click "Đăng nhập"
- **Then** redirect về `/me` (hoặc `?redirect=` query nếu có).

**Edge cases**
- Sai email/password → toast "Email hoặc mật khẩu không đúng" (KHÔNG tiết lộ field nào sai — security).
- Rate limited (429) → toast "Thử quá nhiều lần, đợi 1 phút".
- Đã login mà vào `/login` → auto redirect `/me`.

### US-03 · View profile (`/me`)

> Là **user đã đăng nhập**, tôi muốn **xem thông tin tài khoản của mình**, để **xác nhận đăng nhập đúng**.

**Acceptance**
- **Given** tôi đã login
- **When** tôi vào `/me`
- **Then** thấy email, name, role, ngày tạo, và nút "Đăng xuất".

**Edge cases**
- Chưa login mà vào `/me` → redirect `/login?redirect=/me`.
- Access token hết hạn → tự động gọi `/refresh`, nếu refresh fail → logout + redirect `/login`.

### US-04 · Logout

> Là **user đã đăng nhập**, tôi muốn **đăng xuất**, để **bảo vệ tài khoản trên thiết bị dùng chung**.

**Acceptance**
- **Given** tôi đang ở `/me`
- **When** tôi click "Đăng xuất"
- **Then** access token bị clear khỏi memory, refresh cookie bị xóa, redirect về `/login`.

---

## Field & Validation

Validation phải **khớp 100% backend** (xem `my-agent-backend/src/auth/schemas/login.schema.ts`).

### Register form

| Field | Type | Required | Rule | i18n key error |
|---|---|---|---|---|
| `email` | text/email | ✅ | RFC 5322, max 320 chars | `auth.errors.email_invalid` |
| `name` | text | ✅ | 1–100 chars, trim | `auth.errors.name_required` |
| `password` | password | ✅ | 8–200 chars (BE chỉ check length, FE thêm strength hint) | `auth.errors.password_weak` |
| `passwordConfirm` | password | ✅ | match `password` (chỉ FE) | `auth.errors.password_mismatch` |

### Login form

| Field | Type | Required | Rule |
|---|---|---|---|
| `email` | text/email | ✅ | RFC 5322 |
| `password` | password | ✅ | min 1 char (BE không check strength khi login) |
| `remember` | checkbox | ❌ | UI only ở sprint này, backend chưa support "remember me" |

---

## UI Mockup (ASCII)

### `/login`

```
┌─────────────────────────────────────────────┐
│              [LOGO]                         │
│                                             │
│         Đăng nhập vào tài khoản             │
│                                             │
│   ┌───────────────────────────────────┐    │
│   │ Email                             │    │
│   │ ┌───────────────────────────────┐ │    │
│   │ │ you@example.com               │ │    │
│   │ └───────────────────────────────┘ │    │
│   │                                   │    │
│   │ Mật khẩu                          │    │
│   │ ┌───────────────────────────────┐ │    │
│   │ │ ••••••••••              [👁]   │ │    │
│   │ └───────────────────────────────┘ │    │
│   │                                   │    │
│   │ ☐ Ghi nhớ đăng nhập               │    │
│   │                                   │    │
│   │ ┌───────────────────────────────┐ │    │
│   │ │       Đăng nhập               │ │    │
│   │ └───────────────────────────────┘ │    │
│   │                                   │    │
│   │ Chưa có tài khoản? Đăng ký       │    │
│   └───────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### `/register`

```
┌─────────────────────────────────────────────┐
│              [LOGO]                         │
│                                             │
│            Tạo tài khoản mới                │
│                                             │
│   ┌───────────────────────────────────┐    │
│   │ Họ tên                            │    │
│   │ ┌───────────────────────────────┐ │    │
│   │ │ Nguyễn Văn A                  │ │    │
│   │ └───────────────────────────────┘ │    │
│   │                                   │    │
│   │ Email                             │    │
│   │ ┌───────────────────────────────┐ │    │
│   │ │ you@example.com               │ │    │
│   │ └───────────────────────────────┘ │    │
│   │                                   │    │
│   │ Mật khẩu                          │    │
│   │ ┌───────────────────────────────┐ │    │
│   │ │ ••••••••••              [👁]   │ │    │
│   │ └───────────────────────────────┘ │    │
│   │ Strength: ▓▓▓▓▓░░░░░ Trung bình   │    │
│   │                                   │    │
│   │ Nhập lại mật khẩu                 │    │
│   │ ┌───────────────────────────────┐ │    │
│   │ │ ••••••••••                    │ │    │
│   │ └───────────────────────────────┘ │    │
│   │                                   │    │
│   │ ┌───────────────────────────────┐ │    │
│   │ │       Đăng ký                 │ │    │
│   │ └───────────────────────────────┘ │    │
│   │                                   │    │
│   │ Đã có tài khoản? Đăng nhập       │    │
│   └───────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### `/me`

```
┌─────────────────────────────────────────────┐
│  [LOGO]              Trang chủ  [Đăng xuất] │
├─────────────────────────────────────────────┤
│                                             │
│   Hồ sơ của tôi                             │
│   ─────────────────────────────────────     │
│                                             │
│   ┌──────┐  Tên:    Nguyễn Văn A            │
│   │  N   │  Email:  you@example.com         │
│   │  A   │  Vai trò: [user]                 │
│   └──────┘  Tham gia: 18/04/2026             │
│                                             │
│   ┌───────────────────────────────────┐    │
│   │       Đăng xuất                   │    │
│   └───────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## API Contract (đã có ở backend)

| Endpoint | Method | Body | Response 2xx | Lỗi chính |
|---|---|---|---|---|
| `/api/auth/register` | POST | `{ email, name, password }` | `201 { user, accessToken }` + Set-Cookie `refresh_token` | `409 EMAIL_EXISTS`, `400 VALIDATION` |
| `/api/auth/login` | POST | `{ email, password }` | `200 { user, accessToken }` + Set-Cookie | `401 INVALID_CREDENTIALS`, `429 RATE_LIMITED` |
| `/api/auth/refresh` | POST | (cookie only) | `200 { accessToken }` + Set-Cookie mới | `401 INVALID_REFRESH` |
| `/api/auth/logout` | POST | (cookie only, header Bearer) | `200 { ok: true }` | — |
| `/api/auth/me` | GET | header `Authorization: Bearer <token>` | `200 { user }` | `401 UNAUTHORIZED` |

`user` shape:
```ts
{ id: string; email: string; name: string; role: 'user' | 'admin' | ...; createdAt: string }
```

---

## Definition of Done (sprint)

- [ ] 4 user story đều pass acceptance
- [ ] Form validation hoạt động (cả happy + edge)
- [ ] i18n: VN + EN, không hardcode string
- [ ] Responsive: mobile (≥375px), tablet (≥768px), desktop (≥1024px)
- [ ] Lighthouse a11y ≥ 90 cho `/login`, `/register`, `/me`
- [ ] Test thủ công full flow với 3 user (admin, user, new register)
- [ ] Không có `console.log` trong source
- [ ] `04-history.md` đã ghi lại từng task
