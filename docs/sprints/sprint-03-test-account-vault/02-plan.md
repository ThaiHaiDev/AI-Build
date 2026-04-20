# Sprint 03 — Test Account Vault · Plan (Business Flow)

> **HOW (nghiệp vụ)** • Status: Draft • Updated: 2026-04-20
> Tech stack xem [FRONTEND.md](../../../FRONTEND.md) + [BACKEND.md](../../../BACKEND.md). File này chỉ mô tả luồng nghiệp vụ.

## Luồng chính (Happy path)

### Flow A — Super Admin thêm tài khoản test cho dự án mới

```
Super Admin login
    → /projects → chọn Project Alpha
    → tab "Tài khoản test"
    → click "+ Thêm tài khoản" (section Dev)
    → form: môi trường=Dev, label, username, password, URL, ghi chú
    → submit
    → card xuất hiện ở section Dev
    → lặp lại cho Staging và Production
```

### Flow B — User in project tra cứu và copy tài khoản

```
User login
    → /projects → chọn Project Alpha (đã được assign)
    → tab "Tài khoản test"
    → thấy đủ 3 section Dev / Staging / Production
    → click icon copy bên cạnh password
    → toast "Đã sao chép"
    → paste vào tool test
    (không thấy nút Thêm / Sửa / Xóa)
```

### Flow C — Admin in project sửa password sau khi đổi

```
Admin login
    → /projects → chọn Project Beta (Admin là member active)
    → tab "Tài khoản test"
    → click "Sửa" trên card Staging
    → cập nhật trường Password
    → save
    → card hiển thị đã được cập nhật
```

### Flow D — FE làm UI Redesign song song BE

```
BE: implement B10–B43 (model, endpoints, tests)
FE: làm song song
    Phase 1 (không cần API mới):
        → Update design tokens
        → Redesign AuthLayout, LoginForm, RegisterForm
        → Redesign AppHeader, HomePage, MePage
    Phase 2 (sau khi BE có API):
        → Implement Tab "Tài khoản test"
        → AccountCard + copy-to-clipboard
        → AccountFormModal + CRUD
```

---

## Permission matrix cho TestAccount

```
┌─────────────────────────┐
│ Request vào             │
│ /projects/:id/accounts  │
└──────────┬──────────────┘
           │
      ┌────▼──────┐
      │ Auth?     │
      └────┬──────┘
           │
      ┌────▼──────────────────────────┐
      │ Role SUPER_ADMIN?             │
      └────┬──────────────────────────┘
           │
     [Yes] │ [No]
      │         │
      │    ┌────▼─────────────────────────┐
      │    │ Active member của project?   │
      │    └────┬─────────────────────────┘
      │         │
      │    [Yes]│         [No]
      │         │              │
      │    ┌────▼─────┐       ▼
      │    │ Role?    │     403
      │    └────┬─────┘
      │         │
      │   ┌─────┴──────┐
      │   │            │
      │ [ADMIN]      [USER]
      │   │            │
      ▼   ▼            ▼
   Read + Write    Read only
   (thêm/sửa/xóa)  (xem + copy)
```

---

## State của tài khoản test

```
       ┌──────────────┐
       │   CREATED    │ ← SA hoặc Admin-in-project tạo
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │   ACTIVE     │ ← có thể sửa, xóa
       └──────┬───────┘
              │
         (delete)
              │
              ▼
       ┌──────────────┐
       │   DELETED    │ ← hard delete, không restore
       └──────────────┘
```

Không có archive riêng cho tài khoản — khi dự án archived, tài khoản vẫn hiển thị read-only theo trạng thái dự án.

---

## Decision nghiệp vụ (đã lock)

| # | Câu hỏi | Quyết định | Lý do |
|---|---|---|---|
| D1 | Password lưu plaintext hay mã hoá? | **Plaintext** (phase 1) | Đã thống nhất trong `00-vision.md`; encryption là Phase 2 |
| D2 | Password hiển thị mặc định hay ẩn? | **Ẩn** (`••••••••`), không có nút Reveal ở sprint này | Phase 1 dùng role-based access thay vì mask; Reveal là Phase 2 |
| D3 | Xóa cứng hay mềm (soft delete)? | **Hard delete** | Tài khoản test không cần lịch sử (khác với membership dự án) |
| D4 | Admin có được thêm/sửa/xóa account của **mọi** dự án không? | **Không** — chỉ dự án mình là active member | Admin in project A không chạm được account project B |
| D5 | Race condition 2 Admin cùng sửa? | **Last-write-wins**, không lock | Admin ít, edit thấp tần suất; đủ cho MVP |
| D6 | Giới hạn số tài khoản mỗi env? | **Không giới hạn** ở sprint này | Không có use case cụ thể; thêm nếu cần sau |
| D7 | User bị gỡ khỏi project nhưng đang xem tab Tài khoản test | Request kế tiếp → 403 → redirect `/projects` | Tái sử dụng cơ chế đã có từ sprint-02 (D10 sprint-02) |
| D8 | URL field — validate format hay không? | **Không chặn**, chỉ cảnh báo | Tránh friction; URL nội bộ có thể không theo format chuẩn |
| D9 | Copy clipboard fail (browser không cho phép) | **Fallback**: toast + hiện text thuần để select thủ công | Không nên block user hoàn toàn vì lỗi browser permission |
| D10 | Tab "Tài khoản test" hiển thị cho User ngoài project không? | **Không** — tab ẩn hoặc 403 nếu truy cập trực tiếp | Consistent với permission model sprint-02 |

---

## Edge cases nghiệp vụ

### E1 — Dự án archived: tài khoản test xử lý thế nào?
- Tài khoản vẫn xem được (read-only). Tab "Tài khoản test" hiển thị nhưng nút Thêm/Sửa/Xóa ẩn. Consistent với cách archived project hoạt động ở sprint-02.

### E2 — Admin bị gỡ khỏi project nhưng đang có form sửa tài khoản mở
- Submit form → BE trả 403 → toast "Bạn không còn quyền chỉnh sửa dự án này" → redirect tab về Tổng quan.

### E3 — Nhiều tài khoản trong 1 môi trường
- Hiển thị danh sách, không giới hạn. Scroll tự nhiên trong section.

### E4 — Không có URL
- Tài khoản vẫn hợp lệ. Row URL ẩn hoặc hiện "-". Nút copy URL không hiển thị.

### E5 — Password rỗng (edit xóa trắng password)
- Inline error: "Password không được để trống". Không save.

### E6 — User xem tab nhưng chưa có tài khoản nào
- Cả 3 section hiện empty state nhẹ. Không hiện nút Thêm với User-in-project.

---

## Phụ thuộc

- **Sprint-02 stable**: `Project`, `ProjectMember`, `requireProjectAccess` middleware. Không sửa logic này trong sprint-03.
- **Role system**: tái dùng `SUPER_ADMIN` / `ADMIN` / `USER`; không thêm role mới.
- **Design files**: `docs/ui-designs/design_handoff_auth/` và `docs/ui-designs/design_handoff_home_me/` — cần có trước khi FE bắt đầu Track A.

## Không thuộc sprint này

- Encryption at rest cho password (Phase 2)
- Mask + reveal-on-demand (Phase 2)
- Audit log "ai reveal tài khoản nào khi nào" (Phase 2)
- User Management — tạo user, đổi role (Sprint 04)
- Admin tự sửa thông tin dự án mình phụ trách (chưa xác định sprint)
