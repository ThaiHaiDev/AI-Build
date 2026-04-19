# Roadmap

> **WHEN** • Status: Draft • Owner: @haidz1004 • Created: 2026-04-19

Chia theo sprint, mỗi sprint có 1 business outcome rõ ràng. Chi tiết task kỹ thuật sẽ nằm trong `docs/sprints/sprint-XX-*/03-tasks.md`.

---

## Sprint 01 — Auth foundation ✅ Done

**Outcome**: Người dùng có thể đăng ký / đăng nhập / xem profile / đăng xuất. Role enum và permission hierarchy đã scaffold ở backend.

**Reference**: `docs/sprints/sprint-01-auth-ui/`

**Còn tồn**: [be-auth-contract-gaps.md](../sprints/sprint-01-auth-ui/bugs/be-auth-contract-gaps.md) — response thiếu `name`, `createdAt`, `permissions`; rò rỉ `jti`. Fix trước khi bắt đầu các sprint dùng các field này.

---

## Sprint 02 — Project Management (Super Admin E2E)

**Outcome**: Super Admin có thể end-to-end tạo một dự án mới, thêm thông tin dự án, và gán member vào dự án.

**Scope nghiệp vụ**:

- CRUD dự án (tên, mô tả, tech stack, thông tin đối tác)
- Gán / gỡ member (many-to-many) vào dự án
- User login thấy danh sách dự án mình được gán (Super Admin thấy tất cả)
- Xem chi tiết dự án (thông tin + danh sách member)

**Không trong scope**: account test (dành cho sprint-03), Admin tự sửa dự án, archive dự án.

**Demo criteria**:
- Super Admin đăng nhập, tạo `Project Alpha`, gán 1 Admin + 2 User vào.
- Ba người đó đăng nhập lần lượt, đều thấy `Project Alpha` trong danh sách.
- User thứ 4 không được gán, đăng nhập thấy danh sách rỗng.

---

## Sprint 03 — Test Account Vault

**Outcome**: Mỗi dự án có thể lưu và hiển thị account test 3 môi trường, phân quyền theo role + membership.

**Scope nghiệp vụ**:

- Thêm / sửa / xóa account test theo môi trường (dev/staging/production)
- Mỗi account: label, username, password, URL, ghi chú
- Super Admin: toàn quyền; Admin (in project): toàn quyền trong dự án mình phụ trách; User (in project): chỉ xem
- Copy-to-clipboard cho username / password / URL (UX quality-of-life)

**Phase 1 bảo mật**: plaintext + role-based access (đã thống nhất, xem 00-vision.md).

**Demo criteria**:
- Super Admin thêm 3 account test cho `Project Alpha` (mỗi môi trường 1 cái).
- User (in project) login thấy 3 account, copy được password.
- User không thuộc dự án login không thấy gì.

---

## Sprint 04 — User Management

**Outcome**: Super Admin quản lý được toàn bộ user trong hệ thống.

**Scope nghiệp vụ**:

- Super Admin xem danh sách toàn bộ user, filter theo role / theo dự án
- Super Admin tạo user mới (chỉ định role luôn)
- Super Admin đổi role user (USER ↔ ADMIN ↔ SUPER_ADMIN)
- Super Admin deactivate user (soft, giữ history membership)
- User deactivated bị logout forced ở mọi phiên; không login lại được
- User thường xem và sửa thông tin cá nhân (tên, đổi password)

**Demo criteria**:
- Super Admin tạo user mới với role `ADMIN`.
- Đổi role của 1 user từ `USER` lên `ADMIN` → user đó login lại thấy quyền mới.
- Deactivate 1 user → user đó không login được nữa.

---

## Sprint 05 — Polish & Onboarding UX

**Outcome**: Hệ thống sẵn sàng cho nhân viên mới tự onboard, có search/filter tốt, có audit log cơ bản.

**Scope nghiệp vụ**:

- Search dự án (theo tên, tech stack, đối tác)
- Search user (theo email, tên, role)
- Dashboard empty state cho user chưa được gán dự án nào (hướng dẫn liên hệ ai)
- Audit log cơ bản: ai tạo/sửa/xóa dự án, ai gán/gỡ member, ai sửa account test (chưa cần audit view account)
- UX pass: empty state, loading state, error state ở mọi màn hình chính

**Demo criteria**:
- Nhân viên mới hoàn toàn tự onboard sau khi được tạo account và assign dự án.
- Super Admin xem audit log biết ai vừa sửa cái gì trong 7 ngày qua.

---

## Phase 2 (Post-MVP)

Các hạng mục **bắt buộc** nhưng để sau MVP để ship sớm. Sẽ tách sprint cụ thể khi MVP xong.

- **Encrypted-at-rest** cho password account test (pgcrypto hoặc column-level encryption)
- **Mask + reveal-on-demand** cho password account test (default hiển thị `***`, bấm "Reveal" mới decrypt)
- **Audit log nâng cao**: ai đã reveal account nào khi nào (không chỉ CRUD)
- **SSO** (Google Workspace công ty)
- **Invite flow**: Super Admin tạo user → gửi link set-password qua email, user tự đặt password
- **Notification**: khi password account test đổi, notify các member trong dự án
- **Export CSV** danh sách dự án / account (tùy chính sách công ty)
- **Soft delete + restore** cho dự án và user

---

## Nguyên tắc xếp thứ tự

1. **Super Admin flow trước** (sprint 02-04): vì không có dữ liệu dự án + account thì các role khác không có gì để xem.
2. **Bảo mật cơ bản ngay**: role-based access ở sprint 02-03, nâng cấp encryption ở phase 2.
3. **UX polish cuối**: chấp nhận xấu ở sprint 02-04 để verify business logic đúng trước.
