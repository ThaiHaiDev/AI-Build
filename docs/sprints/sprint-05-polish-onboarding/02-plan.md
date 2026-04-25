# Sprint 05 — History Module + Polish & Onboarding UX · Plan (Business Flow)

> **HOW (nghiệp vụ)** • Status: Draft • Updated: 2026-04-25
> Tech stack xem [FRONTEND.md](../../../FRONTEND.md) + [BACKEND.md](../../../BACKEND.md). File này chỉ mô tả luồng nghiệp vụ.

## Luồng chính (Happy path)

### Flow A — Admin tra cứu ai đổi password account test

```
Admin login
    → Project Alpha → tab "Lịch sử"
    → thấy timeline: "Nguyễn Văn A đã sửa account test Staging Admin – 2 giờ trước"
    → biết ai đổi → liên hệ xác nhận
```

### Flow B — SA tra cứu ai xóa account production

```
SA login → /admin/history
    → filter resourceType = test_account
    → filter action = deleted
    → thấy: "Trần Văn B xóa *Production Admin* – Project Beta – hôm qua 17:42"
    → SA phục hồi thủ công và nhắc nhở
```

### Flow C — SA tìm nhanh user để đổi role

```
SA → /admin/users
    → gõ "nguyen" vào search (debounce 300ms)
    → thấy "Nguyễn Văn A", "Nguyễn Thị B"
    → filter thêm Role = user → còn 1 người
    → đổi role → confirm
```

### Flow D — User mới onboard lần đầu

```
SA tạo account cho nhân viên An → add vào Project Alpha (allowedEnvs=['dev'])
An nhận thông tin đăng nhập
    → Login → Projects: thấy "Project Alpha"
    → Mở Project Alpha → tab Tài khoản test → thấy section Dev
    → Copy password → bắt đầu làm việc
    → Vào /me → đổi password tạm
```

### Flow E — Tìm kiếm dự án nhanh

```
User → /projects → gõ "alpha"
    → debounce 300ms → GET /projects?search=alpha
    → chỉ thấy "Project Alpha"
    → clear search → full list quay lại
```

---

## Kiến trúc History Module (BE)

### Ghi log — fire-and-forget pattern

```
Controller action (create/update/delete) thực hiện xong, trước khi res.json():
    → historyStore.append({
        actorId:      req.user.id,
        action:       'updated',
        resourceType: 'test_account',
        resourceId:   account.id,
        resourceName: `${account.label} – ${account.environment}`,
        projectId:    account.projectId,
        meta: {
          before: { label, username, url, note },  // không có password
          after:  { label, username, url, note },
        }
      })
      .catch((err) => logger.error('History append failed', { err }))
      // không await — không block response chính
```

**Lý do fire-and-forget**: ghi history thất bại không nên làm hỏng action chính.

### Không lưu trong meta

- `password` — tuyệt đối không
- `token` / `hash` — không
- `permissions` array lớn — không (chỉ lưu `role`)

### Query pattern

```sql
-- GET /admin/history?resourceType=test_account&action=deleted
SELECT * FROM "History"
WHERE "resourceType" = 'test_account'
  AND action = 'deleted'
ORDER BY "createdAt" DESC
LIMIT 20 OFFSET 0
```

Filter kết hợp: `resourceType` + `action` + `actorId` + `projectId` + date range (AND logic).

---

## Search — cách implement (BE)

```ts
// Sequelize — GET /projects?search=alpha
where: {
  [Op.or]: [
    { name:        { [Op.iLike]: `%${search}%` } },
    { techStack:   { [Op.iLike]: `%${search}%` } },
    { partnerName: { [Op.iLike]: `%${search}%` } },
  ]
}
```

Không cần migration thêm index cho MVP. Nếu chậm, thêm GIN index sau.

---

## Navigation SA (FE)

Sidebar hiện tại: Home, Projects, Me.

Cần thêm section Admin (chỉ hiện với `role === 'super_admin'`):

```
[Admin]
  ├── Quản lý User    → /admin/users
  └── Lịch sử         → /admin/history
```

---

## Decision kỹ thuật

| # | Quyết định |
|---|---|
| D-S5-T1 | `historyStore.append()` gọi fire-and-forget sau mỗi action, catch + log nếu fail |
| D-S5-T2 | Không dùng middleware tự động — gọi tường minh trong controller để tránh double-log |
| D-S5-T3 | Search ILIKE — Sequelize parameterized query tự bảo vệ SQL injection |
| D-S5-T4 | Skeleton dùng `animate-pulse` Tailwind — không cần thư viện ngoài |
| D-S5-T5 | Error boundary dùng `react-error-boundary` package nếu có trong deps, nếu không thì class component |
| D-S5-T6 | `/admin/history` và tab "Lịch sử" dùng chung `historyService.list()` — khác nhau ở filter param |
