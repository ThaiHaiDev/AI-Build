# BUG · BE Auth Contract Gaps

> Sprint: **01 — Auth UI**
> Status: **DRAFT — chưa fix**, chờ user review trước khi lên lịch.
> Discovered: 2026-04-19 trong quá trình FE test E2E với BE `localhost:8000`.

## Problem

FE type contract (`AuthUser`) mong đợi đầy đủ profile:

```ts
interface AuthUser {
  id: string
  email: string
  role: Role
  name: string
  createdAt: string
  permissions: string[]
}
```

Nhưng BE hiện tại trả về thiếu và sai như sau:

| Endpoint | Response user | Thiếu | Thừa / sai |
|---|---|---|---|
| `POST /api/v1/auth/register` | `{id,email,role}` | `name`, `createdAt`, `permissions` | — |
| `POST /api/v1/auth/login` | `{id,email,role}` | `name`, `createdAt`, `permissions` | — |
| `GET /api/v1/auth/me` | `{id,email,role,jti}` | `name`, `createdAt`, `permissions` | **leak `jti`** |

FE workaround tạm: đặt `name?`, `createdAt?`, `permissions?` optional trong [auth.types.ts](../../../../my-agent-frontend/src/features/auth/types/auth.types.ts) để không crash UI. Workaround phải revert khi BE fix.

## Impact

- **UX**: `/me` không hiển thị được tên user và ngày tham gia (fields trống hoặc fallback khó chịu).
- **Security — permission gating**: `useHasPermission` dựa vào `user.permissions`. Nếu permissions luôn `undefined` → hook hoặc fail-open (mọi UI gated xuất hiện) hoặc fail-closed (ẩn hết). Cả hai đều sai. Sprint 01 chưa dùng permission nên chưa thấy triệu chứng, nhưng Sprint 02+ sẽ vỡ ngay.
- **Security — `jti` leak**: `jti` là JWT identifier nội bộ dùng cho token revocation. Trả cho client → attacker đọc `/me` có thể map token ↔ user và dùng cho abuse/replay analytics; cũng làm rò rỉ chi tiết auth implementation. Phải loại khỏi response public.
- **Contract drift**: OpenAPI/spec (nếu có) không khớp thực tế → dev mới hiểu sai.

## Repro

BE ở `http://localhost:8000`, date 2026-04-19.

```bash
# 1) Register
curl -s -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"bug-repro@example.com","password":"Password123!","name":"Repro User"}'

# Actual:
# { "user": { "id":"...", "email":"bug-repro@example.com", "role":"user" },
#   "accessToken": "<JWT>" }
# Expected: user object phải có name="Repro User", createdAt=<ISO>, permissions=[...].

# 2) Login
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bug-repro@example.com","password":"Password123!"}'

# Actual: giống register — thiếu name/createdAt/permissions.

# 3) /me
TOKEN=<JWT from login>
curl -s http://localhost:8000/api/v1/auth/me -H "Authorization: Bearer $TOKEN"

# Actual:
# { "user": { "id":"...", "email":"...", "role":"user",
#             "jti":"7d95c328f638f3c8c947466fadbfff06" } }
# Expected: không có jti; có name/createdAt/permissions.
```

## Expected contract

Thống nhất public user shape cho cả 3 endpoint:

```jsonc
{
  "user": {
    "id":          "uuid",
    "email":       "string",
    "name":        "string",
    "role":        "user | admin | ...",
    "permissions": ["string"],
    "createdAt":   "ISO-8601 string"
  },
  "accessToken": "jwt"   // chỉ có ở register/login, không có ở /me
}
```

Tuyệt đối **không** bao gồm: `jti`, `passwordHash`, `updatedAt` (nếu không cần), bất kỳ token claim nội bộ nào.

## Fix plan (draft — chờ user duyệt)

> KHÔNG implement. Liệt kê để user review scope.

1. **Centralize `toPublic(user)` serializer** ở BE.
   - Output đúng shape ở mục "Expected contract".
   - `permissions` lấy từ role → permission mapping. FE đã có [shared/constants/permissions.ts](../../../../my-agent-frontend/src/shared/constants/permissions.ts); BE cần source of truth tương ứng (nên là BE authoritative, FE chỉ display).
2. **Sửa 3 handler** dùng `toPublic`:
   - `POST /auth/register` → `{ user: toPublic(user), accessToken }`
   - `POST /auth/login`    → `{ user: toPublic(user), accessToken }`
   - `GET  /auth/me`       → `{ user: toPublic(user) }` (bỏ `jti`)
3. **Integration test**:
   - Assert shape có đúng 6 field ở `user`.
   - Assert **không** có `jti`, `passwordHash`, `password`, `refreshToken` trong response.
4. **OpenAPI / API docs**: update spec nếu có. Không bắt buộc trong scope fix này nếu chưa có.
5. **FE follow-up (sau khi BE fix)**:
   - Revert `auth.types.ts`: `name`, `createdAt`, `permissions` về required.
   - Render đầy đủ field ở `/me` (avatar + joined date).
   - Enable `useHasPermission` cho Sprint 02.

## Out of scope

- Không đổi structure JWT payload (vẫn có jti internal, chỉ bỏ khỏi response).
- Không đổi endpoint path/verb.
- Không đổi error contract.
- Không touch refresh flow.

## Follow-up checklist

- [ ] User review spec này
- [ ] Tạo ticket BE (ví dụ `BE-AUTH-01`)
- [ ] Implement theo fix plan
- [ ] FE revert workaround + enable full rendering
