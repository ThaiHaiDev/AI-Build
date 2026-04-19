# Sprint 02 — Project Management · Plan (Business Flow)

> **HOW (nghiệp vụ)** • Status: Draft • Updated: 2026-04-19
> Tech stack xem [FRONTEND.md](../../../FRONTEND.md) + [BACKEND.md](../../../BACKEND.md). File này chỉ mô tả luồng nghiệp vụ.

## Luồng chính (Happy path)

### Flow A — Super Admin tạo dự án đầu tiên

```
Super Admin login
    → /projects (list rỗng)
    → click "Tạo dự án"
    → form: tên + mô tả + tech stack + đối tác
    → submit
    → dự án xuất hiện ở list
    → click vào dự án → tab "Thành viên"
    → thêm Admin và các User vào
    → các member đó login → thấy dự án
```

### Flow B — Admin / User xem dự án của mình

```
User login
    → /projects
    → thấy list dự án mình được assign (Super Admin thấy tất cả)
    → click 1 dự án
    → xem chi tiết: mô tả, stack, đối tác, danh sách member
    → (chưa thấy account test — dành sprint-03)
```

### Flow C — Super Admin gỡ member

```
Super Admin → /projects/:id → tab "Thành viên"
    → click icon "Gỡ" bên cạnh user
    → confirm modal
    → user bị remove khỏi membership
    → user đó (nếu đang login) → request kế tiếp không thấy dự án
```

### Flow D — Archive dự án

```
Super Admin → /projects/:id
    → click "Archive"
    → confirm
    → dự án chuyển trạng thái archived
    → ẩn khỏi list mặc định
    → member vẫn thấy nếu bật filter "Xem dự án đã archive" (read-only)
```

---

## Visibility rule

```
┌─────────────────┐
│ Request vào     │
│ /projects hoặc  │
│ /projects/:id   │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Role gì? │
    └────┬─────┘
         │
    ┌────┴─────────────────┐
    │                      │
[SUPER_ADMIN]         [ADMIN/USER]
    │                      │
    │              ┌───────▼────────┐
    │              │ Là member của  │
    │              │ dự án này?     │
    │              └───────┬────────┘
    │                      │
    │              ┌───────┴────────┐
    │              │                │
    │            [Yes]           [No]
    │              │                │
    ▼              ▼                ▼
Thấy tất cả    Thấy dự án    403 / ẩn khỏi list
               đó
```

---

## State machine của dự án

```
       ┌──────────────┐
       │   CREATED    │ ← Super Admin tạo
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │   ACTIVE     │ ← mặc định, hiển thị ở list
       └──────┬───────┘
         │         ▲
    (archive)  (un-archive)
         │         │
         ▼         │
       ┌──────────────┐
       │   ARCHIVED   │ ← ẩn mặc định, read-only
       └──────────────┘
```

Không có trạng thái "deleted" ở sprint này (không hard delete).

---

## Decision nghiệp vụ (đã lock)

| # | Câu hỏi | Quyết định | Lý do |
|---|---|---|---|
| D1 | Admin có được sửa thông tin dự án mình phụ trách không? | **Không** (phase 1) | Giới hạn quyền rõ ràng, tránh conflict với Super Admin |
| D2 | Dự án có hard delete không? | **Không**, chỉ archive | Giữ history membership phục vụ audit |
| D3 | Member bị gỡ có được giữ lịch sử membership không? | **Có** (soft remove, lưu thời điểm gỡ) | Phục vụ audit & khôi phục khi gỡ nhầm |
| D4 | Super Admin có phải là member của dự án để xem không? | **Không** — role SUPER_ADMIN luôn thấy tất cả | Theo permission matrix ở personas doc |
| D5 | Tên dự án có unique không? | **Có** — không cho trùng | Dễ reference trong team, tránh nhầm |
| D6 | Có project code ngắn (vd `PRJ-ABC`) không? | **Hoãn**, chỉ dùng tên + id | Giữ sprint gọn; có thể thêm phase 2 nếu team thấy cần |
| D7 | Archived project — member có thấy không? | **Có** (read-only + badge) | Phục vụ tra cứu sau khi dự án kết thúc |
| D8 | Archived project — có sửa thông tin / member được không? | **Không** | Đúng nghĩa "archived" — frozen state |
| D9 | Khi Super Admin gán 1 user vào dự án, user đó đang login — cần logout để có hiệu lực? | **Không** — request kế tiếp tự thấy | Không bắt user logout lại |
| D10 | Khi Super Admin gỡ user, user đang xem trang chi tiết dự án — xử lý gì? | Request tiếp theo của user đó (refresh, click) → 403 → redirect `/projects` + toast | Enforce real-time permission |
| D11 | Gỡ chính mình (Super Admin tự gỡ khỏi membership) có chặn không? | **Không chặn** | Super Admin vẫn thấy mọi dự án vì role, không ảnh hưởng |
| D12 | Search dự án trong sprint này? | **Có ở cấp đơn giản**: filter theo tên (client-side nếu list ngắn) | UX tối thiểu; search nâng cao dành sprint-05 |

---

## Edge cases nghiệp vụ

### E1 — Race condition: 2 Super Admin cùng sửa 1 dự án
- Không lock. Save sau đè save trước (last-write-wins).
- Chấp nhận vì Super Admin ít, low-frequency edit.

### E2 — Super Admin gán user, user đó bị deactivate ở sprint-04
- Sprint-02 chưa có deactivate. Sprint-04 sẽ xử lý: user deactivated không login được, membership giữ nguyên.

### E3 — Dự án không có member nào
- Cho phép (mới tạo chưa add ai). Chỉ Super Admin thấy.

### E4 — Gán user vào rất nhiều dự án (100+)
- Không giới hạn cứng. UX list dự án của user đó phải handle pagination/scroll (basic ở sprint này, polish sprint-05).

### E5 — Tên dự án có ký tự unicode / emoji
- Cho phép. Trim whitespace 2 đầu trước khi save.

### E6 — User click vào dự án ngay lúc Super Admin đang archive
- User thấy dự án với badge "Đã archive", chức năng edit (nếu là Super Admin) disable.

### E7 — Mở 2 tab: gán user ở tab A, tab B đang xem list member
- Tab B không auto-update. User refresh mới thấy. Chấp nhận cho MVP (không cần realtime).

---

## Phụ thuộc

- **Backend auth contract fix** (BE-BUG-01): bắt buộc fix trước vì permission gating ở FE (`useHasPermission`) cần `permissions` trong response. Chi tiết [bugs/be-auth-contract-gaps.md](../sprint-01-auth-ui/bugs/be-auth-contract-gaps.md).
- **Role system**: dùng lại `SUPER_ADMIN` / `ADMIN` / `USER` đã có, không thêm role mới.
- **Product docs**: [product/01-personas-and-roles.md](../../product/01-personas-and-roles.md) là source of truth cho permission matrix.

## Không thuộc sprint này (gợi ý sprint sau)

- Account test 3 môi trường (Sprint 03)
- Admin tự sửa thông tin dự án mình phụ trách
- Super Admin tạo user mới / đổi role (Sprint 04)
- Audit log CRUD dự án (Sprint 05)
- Search nâng cao (filter theo tech stack, đối tác) (Sprint 05)
- Project code ngắn `PRJ-XXX` (Phase 2 nếu cần)
