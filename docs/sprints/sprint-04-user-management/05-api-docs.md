# Sprint 04 — API Reference (FE)

> **Base URL**: `http://localhost:8000/api/v1`
> **Auth**: tất cả endpoint (trừ register/login/refresh) cần header `Authorization: Bearer <accessToken>`
> **Error format** (chung toàn bộ API):
> ```json
> { "error": { "code": "ERROR_CODE", "message": "..." }, "requestId": "uuid" }
> ```

---

## 1. User Management (SA only)

### `GET /auth/admin/users`

Lấy danh sách toàn bộ user trong hệ thống.

**Query params**

| Param | Type | Mô tả |
|-------|------|-------|
| `role` | `"super_admin" \| "admin" \| "user"` | Filter theo role (optional) |
| `isActive` | `"true" \| "false"` | Filter theo trạng thái (optional) |

**Response 200**
```json
{
  "users": [
    {
      "id":          "uuid",
      "email":       "leader@example.com",
      "name":        "Leader",
      "role":        "admin",
      "permissions": ["user:read", "..."],
      "createdAt":   "2026-04-20T10:00:00.000Z"
    }
  ]
}
```

> `isActive` chưa có trong response `PublicUser` — chỉ dùng để filter. Nếu FE cần hiển thị badge trạng thái thì mở issue BE để thêm field.

**Errors**

| Code | HTTP | Khi nào |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Chưa login |
| `FORBIDDEN` | 403 | Không phải SA |

---

### `POST /auth/admin/users`

Tạo user mới.

**Request body**
```json
{
  "email":    "newuser@example.com",
  "name":     "Nguyễn Văn A",
  "password": "Password@123",
  "role":     "user"
}
```

| Field | Required | Validation |
|-------|----------|-----------|
| `email` | ✅ | Valid email, max 320 ký tự |
| `name` | ✅ | min 1, max 100 |
| `password` | ✅ | min 8, max 128 |
| `role` | ❌ | `"user" \| "admin" \| "super_admin"`, default `"user"` |

**Response 201**
```json
{
  "user": {
    "id":          "uuid",
    "email":       "newuser@example.com",
    "name":        "Nguyễn Văn A",
    "role":        "user",
    "permissions": ["session:read", "..."],
    "createdAt":   "2026-04-25T10:00:00.000Z"
  }
}
```

**Errors**

| Code | HTTP | Khi nào |
|------|------|---------|
| `CONFLICT` | 409 | Email đã được dùng |
| `VALIDATION` | 400 | Field thiếu / sai format |

---

### `PATCH /auth/admin/users/:userId/role`

Đổi role của user.

**Request body**
```json
{ "role": "admin" }
```

| Field | Required | Values |
|-------|----------|--------|
| `role` | ✅ | `"user" \| "admin" \| "super_admin"` |

**Response 200**
```json
{ "user": { /* PublicUser */ } }
```

**Errors**

| Code | HTTP | Khi nào |
|------|------|---------|
| `SELF_ACTION_FORBIDDEN` | 403 | SA tự đổi role mình |
| `NOT_FOUND` | 404 | User không tồn tại |

---

### `PATCH /auth/admin/users/:userId/deactivate`

Deactivate user. User bị logout forced ở mọi phiên ngay lập tức.

**Request body**: không cần

**Response 200**
```json
{ "user": { /* PublicUser */ } }
```

**Errors**

| Code | HTTP | Khi nào |
|------|------|---------|
| `SELF_ACTION_FORBIDDEN` | 403 | SA tự deactivate mình |
| `NOT_FOUND` | 404 | User không tồn tại |

> **Lưu ý FE**: sau khi deactivate, mọi request của user đó sẽ nhận `401 "Account deactivated"` — không cần FE chủ động xử lý thêm. Có thể cập nhật badge "Deactivated" trực tiếp trên UI mà không cần refetch.

---

## 2. Self-service (bất kỳ user đã login)

### `PATCH /auth/me`

Cập nhật tên hiển thị của bản thân.

**Request body**
```json
{ "name": "Tên mới" }
```

| Field | Required | Validation |
|-------|----------|-----------|
| `name` | ✅ | min 1, max 100 |

**Response 200**
```json
{ "user": { /* PublicUser cập nhật */ } }
```

---

### `PATCH /auth/me/password`

Đổi password. Tất cả phiên đăng nhập trên thiết bị khác bị logout.

**Request body**
```json
{
  "currentPassword": "OldPass@123",
  "newPassword":     "NewPass@456"
}
```

| Field | Required | Validation |
|-------|----------|-----------|
| `currentPassword` | ✅ | Bất kỳ string |
| `newPassword` | ✅ | min 8, max 128 |

**Response 200**
```json
{ "ok": true }
```

**Errors**

| Code | HTTP | Khi nào |
|------|------|---------|
| `VALIDATION` | 400 | `currentPassword` sai |

> **Lưu ý FE**: phiên hiện tại **không** bị logout — access token vẫn còn hiệu lực đến khi expire (15 phút). Nên gọi `POST /auth/refresh` ngay sau khi đổi xong để lấy session mới.

---

## 3. Env-Level Permission (Account Vault)

### `GET /projects/:projectId/accounts` — **breaking change**

Response nay trả thêm `grantedEnvs` và **chỉ trả các key env mà người gọi có quyền** (không còn luôn trả đủ 3 key).

**Response 200**
```json
{
  "accounts": {
    "dev": [
      {
        "id":          "uuid",
        "projectId":   "uuid",
        "environment": "dev",
        "label":       "Admin Portal",
        "username":    "admin_dev",
        "password":    "Dev@12345",
        "url":         "https://dev.app.com",
        "note":        "Tài khoản ADMIN đầy đủ quyền",
        "createdBy":   "uuid",
        "createdAt":   "2026-04-20T10:00:00.000Z",
        "updatedAt":   "2026-04-20T10:00:00.000Z"
      }
    ],
    "staging": []
    /* "production" không xuất hiện nếu không có quyền */
  },
  "grantedEnvs": ["dev", "staging"]
}
```

> **Lưu ý FE**: dùng `grantedEnvs` để biết nên render section nào — đừng hardcode loop qua 3 env. Section vắng mặt trong `grantedEnvs` → **ẩn hoàn toàn**, không hiện "bạn không có quyền".

---

### `PATCH /projects/:projectId/members/:memberId/env-access`

Cập nhật danh sách môi trường được phép của 1 member trong project.

> **Quan trọng**: `memberId` là **id bản ghi ProjectMember** (field `id` trong `GET /members`), **không phải** `userId`.

**Auth**: SA hoặc Admin active member của project.

**Request body**
```json
{ "allowedEnvs": ["dev", "staging"] }
```

| Field | Required | Validation |
|-------|----------|-----------|
| `allowedEnvs` | ✅ | Array `"dev" \| "staging" \| "production"`, min 1 phần tử |

**Response 200**
```json
{
  "member": {
    "id":          "uuid",
    "userId":      "uuid",
    "allowedEnvs": ["dev", "staging"]
  }
}
```

**Errors**

| Code | HTTP | Khi nào |
|------|------|---------|
| `FORBIDDEN` | 403 | Role User cố gọi |
| `ENV_ACCESS_FORBIDDEN` | 403 | Admin grant env ngoài quyền của mình |
| `VALIDATION` | 400 | `allowedEnvs` rỗng hoặc giá trị ngoài enum |
| `NOT_FOUND` | 404 | `memberId` không thuộc project này |

---

### `GET /projects/:projectId/members` — **có thêm field**

Response member nay có thêm `allowedEnvs`.

**Response 200**
```json
{
  "members": [
    {
      "id":          "uuid",
      "userId":      "uuid",
      "email":       "user@example.com",
      "name":        "User",
      "role":        "user",
      "allowedEnvs": ["dev"],
      "addedAt":     "2026-04-20T10:00:00.000Z",
      "addedBy":     "uuid"
    }
  ]
}
```

---

### `POST /projects/:projectId/members` — **có thêm field**

Thêm member với `allowedEnvs` tuỳ chọn.

**Request body**
```json
{
  "userId":      "uuid",
  "allowedEnvs": ["dev"]
}
```

| Field | Required | Default | Validation |
|-------|----------|---------|-----------|
| `userId` | ✅ | — | UUID |
| `allowedEnvs` | ❌ | `["dev"]` | Array env, min 1 |

**Response 201**: danh sách member mới (shape không thay đổi, chỉ thêm `allowedEnvs`).

---

## 4. Error Codes Mới

| Code | HTTP | Mô tả |
|------|------|-------|
| `SELF_ACTION_FORBIDDEN` | 403 | SA cố tự deactivate / tự đổi role |
| `ENV_ACCESS_FORBIDDEN` | 403 | Không có quyền môi trường đó; hoặc Admin grant env vượt quyền mình |
| `ACCOUNT_DEACTIVATED` | 401 | User bị deactivate — message: `"Account deactivated"` |

---

## 5. Lưu ý tích hợp FE

1. **`ACCOUNT_DEACTIVATED`**: khi nhận `401 + message "Account deactivated"` ở bất kỳ request nào → auto logout, clear state, redirect `/login`.
2. **`grantedEnvs`**: đọc từ response `GET /accounts`, render section tương ứng — không hardcode 3 section.
3. **`memberId` vs `userId`**: `PATCH /env-access` dùng `members[].id` (ProjectMember id), lấy từ response `GET /members`.
4. **`isActive` chưa trong `PublicUser`**: user list cần hiện badge trạng thái → tạm dùng filter query `isActive=false` để biết ai bị deactivate, hoặc mở issue BE thêm field.
