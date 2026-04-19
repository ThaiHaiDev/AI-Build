# API — Projects & Members (Sprint-02)

> **Audience**: FE team sắp triển khai F10–F98.
> **Base URL**: `http://localhost:8000/api/v1`
> **Auth**: tất cả endpoint đều cần `Authorization: Bearer <accessToken>` (cookie refresh token xử lý ở auth flow — xem sprint-01).
> **Updated**: 2026-04-19

## Tổng quan

- 10 endpoint: 6 CRUD project + 3 member + 1 user search (phục vụ modal thêm member)
- Visibility rule: Super Admin thấy mọi project; Admin/User chỉ thấy project mình là active member
- Không hard delete — dùng `POST /projects/:id/archive` + `/unarchive`
- Không có pagination ở sprint-02 (sẽ thêm sprint-05)

---

## Error envelope

Tất cả lỗi trả shape thống nhất:

```json
{ "error": { "code": "STRING_CODE", "message": "Human-readable message" } }
```

| HTTP | `code` | Khi nào |
|---|---|---|
| 400 | `VALIDATION` | body/query sai schema zod |
| 401 | `UNAUTHORIZED` | thiếu/invalid Bearer token |
| 403 | `FORBIDDEN` | sai role hoặc không phải member |
| 404 | `NOT_FOUND` | project/member không tồn tại |
| 409 | `CONFLICT` | trùng tên, archived, đã là member |
| 429 | `RATE_LIMIT` | spam `POST /projects` hoặc `POST /members` |

---

## TypeScript types (copy sang FE)

```ts
export type ProjectStatus = 'active' | 'archived';

export type Role = 'super_admin' | 'admin' | 'manager' | 'editor' | 'user' | 'guest' | 'anonymous';

export interface Project {
  id:                 string;
  name:               string;
  description:        string | null;
  techStack:          string | null;
  partnerName:        string | null;
  partnerContactName: string | null;
  partnerEmail:       string | null;
  partnerPhone:       string | null;
  status:             ProjectStatus;
  archivedAt:         string | null; // ISO-8601
  createdBy:          string;        // user id
  createdAt:          string;        // ISO-8601
  updatedAt:          string;        // ISO-8601
}

export interface ProjectMember {
  id:      string;   // membership row id
  userId:  string;
  email:   string;
  name:    string;
  role:    Role;
  addedAt: string;   // ISO-8601
  addedBy: string;   // user id
}

export interface UserSummary {
  id:    string;
  email: string;
  name:  string;
  role:  Role;
}
```

---

## 1. `GET /projects` — List projects của user

Trả về list project mà user đang thấy được (Super Admin: tất cả; others: chỉ project mình là active member).

**Role**: any authenticated user.

**Query**:
```
?includeArchived=true|false   (optional, default: false)
```

**Response 200**:
```json
{ "projects": [ Project, Project, ... ] }
```

**Errors**: 401.

**curl**:
```bash
curl -s http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN"

curl -s "http://localhost:8000/api/v1/projects?includeArchived=true" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 2. `POST /projects` — Tạo project

**Role**: `SUPER_ADMIN` only. Rate-limited (20 req/phút/user).

**Body**:
```ts
{
  name:                string;          // required, 1-200, trim
  description?:        string | null;   // max 5000
  techStack?:          string | null;   // max 2000
  partnerName?:        string | null;   // max 200
  partnerContactName?: string | null;   // max 100
  partnerEmail?:       string | null;   // email format, max 320
  partnerPhone?:       string | null;   // max 30
}
```

**Response 201**:
```json
{ "project": Project }
```

**Errors**:
- 400 `VALIDATION` — name trống, field vượt giới hạn, email sai format
- 403 `FORBIDDEN` — không phải Super Admin
- 409 `CONFLICT` — tên trùng (case-insensitive)
- 429 `RATE_LIMIT`

**curl**:
```bash
curl -s -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Project Delta","description":"Demo","techStack":"Vue, Go"}'
```

---

## 3. `GET /projects/:id` — Chi tiết project

**Role**: Super Admin hoặc active member của project.

**Path**: `id` — UUID project.

**Response 200**:
```json
{ "project": Project }
```

**Errors**: 401, 403 (không phải member), 404.

---

## 4. `PATCH /projects/:id` — Sửa project

**Role**: `SUPER_ADMIN` only. Không sửa được project đã archived.

**Body**: tất cả field của create đều optional (partial update).

**Response 200**: `{ "project": Project }`

**Errors**:
- 400 `VALIDATION`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT` — trùng tên hoặc project đã archived

---

## 5. `POST /projects/:id/archive`

**Role**: `SUPER_ADMIN` only.

**Response 200**: `{ "project": Project }` với `status="archived"`, `archivedAt` set.

**Errors**: 403, 404, 409 (đã archived).

---

## 6. `POST /projects/:id/unarchive`

**Role**: `SUPER_ADMIN` only.

**Response 200**: `{ "project": Project }` với `status="active"`.

**Errors**: 403, 404, 409 (đang active).

---

## 7. `GET /projects/:id/members` — List member

**Role**: Super Admin hoặc active member.

**Response 200**:
```json
{ "members": [ ProjectMember, ... ] }
```

Sắp xếp theo `addedAt` ASC.

**Errors**: 401, 403, 404.

---

## 8. `POST /projects/:id/members` — Thêm member

**Role**: `SUPER_ADMIN` only. Rate-limited. Không thêm được vào project đã archived.

**Body**:
```ts
{ userId: string /* UUID */ }
```

**Response 201**:
```json
{ "members": [ ProjectMember, ... ] }
```
Trả về toàn bộ list member mới (không chỉ row vừa add) để FE refresh đơn giản.

**Errors**:
- 400 `VALIDATION` — userId không phải UUID
- 400 `VALIDATION` (code reuse) — user không tồn tại
- 403 `FORBIDDEN`
- 404 `NOT_FOUND` — project không tồn tại
- 409 `CONFLICT` — đã là active member hoặc project archived
- 429 `RATE_LIMIT`

---

## 9. `DELETE /projects/:id/members/:userId` — Gỡ member

**Role**: `SUPER_ADMIN` only. Soft remove (giữ history với `removedAt`).

**Response 200**:
```json
{ "members": [ ProjectMember, ... ] }
```

**Errors**: 403, 404 (project hoặc membership không tồn tại), 409 (project archived).

**Note cho FE**: sau khi gỡ, nếu user bị gỡ đang mở trang đó → request kế tiếp của họ → 403 → FE redirect `/projects` + toast (TC-MB-03, D10).

---

## 10. `GET /users?search=<q>` — Search user cho modal thêm member

**Role**: `SUPER_ADMIN` only.

**Query**:
```
?search=<string>   // required, 1-100 ký tự, match iLIKE trên email và name
```

**Response 200**:
```json
{ "users": [ UserSummary, ... ] }
```

Limit 20, order theo email ASC. Chỉ trả user `is_active=true`.

**Errors**: 400 (search rỗng), 403, 401.

**Note cho FE**: debounce input ~300ms. Khi hiển thị trong modal, **disable** các user đã là active member của project hiện tại (client-side compare với list `/members` đã fetch).

---

## Visibility & permission — tóm tắt cho FE

| Action UI | Check FE (hide button) | Check BE |
|---|---|---|
| Nút "Tạo project" | `role === SUPER_ADMIN` | `requireRole(SUPER_ADMIN)` |
| Nút "Sửa" / "Archive" / "Thêm member" / "Gỡ member" | `role === SUPER_ADMIN` và `project.status === 'active'` | `requireRole(SUPER_ADMIN)` + check archived |
| Xem list project | always visible cho user login | `listForUser` tự lọc theo role + membership |
| Xem chi tiết project | always (FE không biết membership trước) | `requireProjectAccess` → 403 nếu không phải member/SA |
| Nút filter "Xem dự án đã archive" | always visible nhưng mặc định off | `?includeArchived=true` |

**Defense in depth**: FE ẩn UI theo role là tầng 1 (UX); BE kiểm tra lại tầng 2 (security). Không bao giờ tin role từ FE.

---

## Seed data (dev)

Start `npm run dev` → seed tự chạy nếu DB trống:

| Email | Password | Role | Member của |
|---|---|---|---|
| `admin@example.com` | `Admin@12345` | SUPER_ADMIN | — (SA thấy tất cả) |
| `leader@example.com` | `Leader@12345` | ADMIN | Project Alpha |
| `user@example.com` | `User@12345` | USER | Project Alpha |
| `outsider@example.com` | `Outsider@12345` | USER | (không thuộc đâu) |

| Project | Status | Members |
|---|---|---|
| Project Alpha | active | leader, user |
| Project Beta | active | — |
| Project Gamma | archived | — |

Dùng 4 account này để chạy full test cases ở [sprint-02/05-test-cases.md](../../docs/sprints/sprint-02-project-management/05-test-cases.md).

---

## Changelog

- **2026-04-19** — v1: 10 endpoint ship kèm sprint-02.
