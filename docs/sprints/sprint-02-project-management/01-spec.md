# Sprint 02 — Project Management · Spec

> **WHAT/WHY** • Status: Draft • Owner: @haidz1004 • Created: 2026-04-19

## Mục tiêu sprint

Super Admin có thể end-to-end quản lý danh mục dự án của công ty: tạo mới, chỉnh sửa, archive, và gán / gỡ thành viên. Người dùng (Admin / User) đăng nhập thấy được danh sách dự án mình thuộc và chi tiết từng dự án.

## Out of scope (sprint sau)

- Account test của dự án (Sprint 03)
- Admin / User tự sửa dự án (phase 1 chỉ Super Admin sửa)
- User Management — tạo user, đổi role, deactivate (Sprint 04)
- Search / filter nâng cao, audit log (Sprint 05)
- Invite flow qua email, SSO (Phase 2)

## Phụ thuộc tiên quyết

- **BE-BUG-01**: Fix contract `/auth/register|login|me` (thêm `name`, `createdAt`, `permissions`, bỏ `jti`). Chi tiết: [bugs/be-auth-contract-gaps.md](../sprint-01-auth-ui/bugs/be-auth-contract-gaps.md). **Phải fix trong sprint-02 trước khi triển khai permission gating**.

---

## User Stories

### US-01 · Super Admin tạo dự án mới

> Là **Super Admin**, tôi muốn **tạo một dự án mới với đầy đủ thông tin**, để **quản lý danh mục dự án công ty tập trung**.

**Acceptance**
- **Given** tôi là Super Admin đã login, ở trang `/projects`
- **When** tôi click "Tạo dự án" → điền tên + mô tả + tech stack + thông tin đối tác + submit
- **Then** dự án mới hiện trong danh sách, tôi có thể mở chi tiết để xem lại.

**Edge cases**
- Tên dự án trống → inline error, submit disabled.
- Tên trùng với dự án đã có → toast "Tên dự án đã tồn tại".
- Mô tả rất dài (> 2000 ký tự) → cảnh báo nhưng vẫn cho submit (không chặn).
- Network error giữa chừng → toast "Kết nối thất bại", form giữ nguyên data.

### US-02 · Super Admin sửa thông tin dự án

> Là **Super Admin**, tôi muốn **sửa thông tin dự án đã tạo**, để **cập nhật khi có thay đổi (đổi tên đối tác, thêm stack mới)**.

**Acceptance**
- **Given** tôi ở trang chi tiết dự án
- **When** click "Sửa" → thay đổi field → save
- **Then** thông tin mới được lưu, danh sách tự refresh.

**Edge cases**
- Sửa trùng tên với dự án khác → từ chối + toast.
- Đang sửa mà dự án bị người khác xóa → thông báo "Dự án không còn tồn tại" + redirect về list.

### US-03 · Super Admin archive dự án

> Là **Super Admin**, tôi muốn **archive dự án đã kết thúc**, để **giữ lịch sử mà không làm rối danh sách đang chạy**.

**Acceptance**
- **Given** tôi ở trang chi tiết dự án
- **When** click "Archive" → xác nhận
- **Then** dự án chuyển trạng thái `archived`, ẩn khỏi list mặc định, hiện khi bật filter "Xem dự án đã archive".

**Edge cases**
- Archive dự án đang có member → vẫn cho, member vẫn thấy dự án ở list (có badge "Đã archive"), không sửa được nữa.
- Un-archive: cho phép (Super Admin click "Khôi phục" ở dự án archived).
- Không có chức năng delete cứng ở sprint này.

### US-04 · Super Admin gán / gỡ member

> Là **Super Admin**, tôi muốn **gán hoặc gỡ thành viên khỏi dự án**, để **kiểm soát ai được xem dự án**.

**Acceptance**
- **Given** tôi ở trang chi tiết dự án, tab "Thành viên"
- **When** click "Thêm thành viên" → chọn user từ danh sách (search theo email/tên) → confirm
- **Then** user được add vào danh sách member, user đó login sẽ thấy dự án.
- **When** click icon "Gỡ" bên cạnh 1 member → confirm
- **Then** user bị loại khỏi dự án, lần request kế tiếp của user đó sẽ không còn thấy dự án.

**Edge cases**
- Thêm user đã là member → disable option trong dropdown + tooltip "Đã là thành viên".
- Gỡ chính mình (Super Admin tự gỡ khỏi dự án) → cho phép (Super Admin vẫn thấy mọi dự án vì role).
- Không có user nào trong hệ thống ngoài Super Admin → dropdown empty state "Chưa có user để add".

### US-05 · User xem danh sách dự án của mình

> Là **Admin / User đã login**, tôi muốn **xem danh sách dự án mình được gán**, để **biết mình thuộc những dự án nào**.

**Acceptance**
- **Given** tôi là Admin hoặc User, đã login
- **When** vào `/projects`
- **Then** thấy card/list các dự án mình là member (Super Admin thấy tất cả).

**Edge cases**
- Chưa được gán dự án nào → empty state: "Bạn chưa thuộc dự án nào. Liên hệ PM/Leader để được add."
- Tất cả dự án mình thuộc đều đã archived → hiện empty state tương tự + hint "Bật filter xem dự án đã archive".

### US-06 · User xem chi tiết dự án

> Là **member của dự án**, tôi muốn **xem chi tiết dự án**, để **hiểu về business, stack, đối tác, và ai cùng team**.

**Acceptance**
- **Given** tôi là member của dự án X
- **When** click vào dự án X trong list
- **Then** thấy: tên, mô tả, tech stack, thông tin đối tác, danh sách member (với role của từng người).

**Edge cases**
- Truy cập bằng URL trực tiếp `/projects/:id` mà không phải member → 403, redirect `/projects` + toast "Không có quyền xem dự án này".
- Dự án không tồn tại → 404 page.
- Dự án đã archived → vẫn xem được (read-only), hiện badge "Đã archive".

---

## UI Mockup (ASCII)

### `/projects` — Danh sách dự án

```
┌────────────────────────────────────────────────────────┐
│ Dự án                          [+ Tạo dự án] (SA only) │
│ ──────────────────────────────────────────────────────│
│ [□ Xem dự án đã archive]         🔍 [Tìm dự án____]   │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ PROJECT ALPHA                         [active]   │  │
│ │ Mô tả ngắn dự án ABC, làm cho đối tác XYZ...     │  │
│ │ Stack: React · Node · Postgres                   │  │
│ │ 👥 5 thành viên                                  │  │
│ └──────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────┐  │
│ │ PROJECT BETA                          [active]   │  │
│ │ ...                                              │  │
│ └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### `/projects/:id` — Chi tiết dự án

```
┌────────────────────────────────────────────────────────┐
│ ← Dự án / PROJECT ALPHA             [Sửa] [Archive]   │
│                                     (SA only)         │
│ ──────────────────────────────────────────────────────│
│ [ Tổng quan ] [ Thành viên (5) ]                      │
│ ──────────────────────────────────────────────────────│
│ Mô tả:                                                 │
│   Hệ thống quản lý đơn hàng cho đối tác XYZ...        │
│                                                        │
│ Tech stack:                                            │
│   React · TypeScript · Node.js · Postgres · AWS       │
│                                                        │
│ Đối tác:                                               │
│   Công ty XYZ Ltd.                                     │
│   Liên hệ: Nguyen Van A · a@xyz.com · +84 xxx         │
└────────────────────────────────────────────────────────┘
```

### `/projects/:id` — Tab Thành viên

```
┌────────────────────────────────────────────────────────┐
│ [ Tổng quan ] [ Thành viên (5) ]                      │
│ ──────────────────────────────────────────────────────│
│ Thành viên                          [+ Thêm] (SA only)│
│ ──────────────────────────────────────────────────────│
│ 👤 Nguyen Van A      a@company.com     ADMIN   [ × ]  │
│ 👤 Tran Thi B        b@company.com     USER    [ × ]  │
│ 👤 Le Van C          c@company.com     USER    [ × ]  │
└────────────────────────────────────────────────────────┘
```

### Modal Thêm thành viên

```
┌─────────────────────────────────────┐
│ Thêm thành viên vào PROJECT ALPHA   │
│ ─────────────────────────────────── │
│ 🔍 [Tìm user theo email hoặc tên_] │
│                                     │
│ ○ a@company.com — Nguyen Van A      │
│ ○ b@company.com — Tran Thi B  [✓]   │
│ ○ c@company.com — Le Van C          │
│                                     │
│          [ Hủy ]  [ Thêm ]          │
└─────────────────────────────────────┘
```

---

## Definition of Done

- [ ] BE bug `be-auth-contract-gaps.md` đã fix + FE revert workaround
- [ ] Super Admin: CRUD dự án + gán/gỡ member, E2E chạy được local
- [ ] Admin / User login chỉ thấy dự án mình thuộc
- [ ] Truy cập URL dự án không thuộc → 403
- [ ] User bị gỡ khỏi dự án → request kế tiếp không còn thấy dự án
- [ ] Archive / un-archive hoạt động, filter hiển thị đúng
- [ ] Permission matrix ở [01-personas-and-roles.md](../../product/01-personas-and-roles.md) enforce đúng ở cả BE và FE
- [ ] Test thủ công đủ 6 user story với 3 account khác role
- [ ] Không console.log / hardcode string / i18n thiếu key
