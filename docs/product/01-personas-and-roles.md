# Personas & Roles

> **WHO** • Status: Draft • Owner: @haidz1004 • Created: 2026-04-19

## 3 Personas

### 1. Super Admin — PM / Leader dự án

- **Ai**: quản lý cấp cao (PM, Project Leader, Head of Engineering)
- **Mục tiêu**: nắm toàn bộ danh mục dự án và phân bổ nhân sự
- **Việc hay làm**:
  - Thêm dự án mới khi công ty nhận contract
  - Gán Dev Lead (Admin) và member (User) vào dự án
  - Tạo tài khoản cho nhân viên mới, đổi role khi cần
  - Archive dự án khi kết thúc

### 2. Admin — Dev Lead / Technical Lead

- **Ai**: Dev Lead, Tech Lead, người phụ trách kỹ thuật 1 hoặc nhiều dự án
- **Mục tiêu**: có đủ thông tin để dẫn dắt team kỹ thuật của dự án mình phụ trách
- **Việc hay làm**:
  - Xem thông tin dự án mình được gán
  - Xem và cập nhật account test của các dự án mình phụ trách (khi QC báo đổi password, khi thêm account mới)
  - Xem danh sách member trong dự án
  - Gán / điều chỉnh env access (`allowedEnvs`) cho từng member trong dự án mình phụ trách
  - Xem lịch sử thay đổi trong dự án (ai sửa/xóa account test, ai thêm/gỡ member)

### 3. User — Nhân viên / Developer / QC

- **Ai**: dev, QC, nhân viên mới, hoặc thành viên bình thường trong dự án
- **Mục tiêu**: có đủ thông tin để làm việc mà không cần đi hỏi ai
- **Việc hay làm**:
  - Login → xem các dự án mình được assign
  - Vào 1 dự án → xem account test theo các môi trường được cấp quyền + thông tin dự án
  - Copy account để dùng cho việc test/dev

## Role mapping trong hệ thống

Dùng lại enum đã có từ sprint-01:

| Persona | Role trong DB |
|---|---|
| PM / Leader | `SUPER_ADMIN` |
| Dev Lead / Tech Lead | `ADMIN` |
| Nhân viên thường | `USER` |

- **Register tự phục vụ** (form /register public) → mặc định role là `USER`.
- Việc nâng role `USER` → `ADMIN` / `SUPER_ADMIN` chỉ do Super Admin thao tác trong Module User Management.

## Permission matrix

Lưu ý: cột "Admin (in project)" và "User (in project)" chỉ áp dụng cho dự án mà người đó được assign. Với dự án không được assign, họ **không thấy dự án đó tồn tại**.

| Action | Super Admin | Admin (in project) | User (in project) |
|---|---|---|---|
| Tạo dự án mới | ✅ | ❌ | ❌ |
| Sửa thông tin dự án | ✅ | ❌ (phase 1) | ❌ |
| Xóa / archive dự án | ✅ | ❌ | ❌ |
| Gán / gỡ member vào dự án | ✅ | ❌ (phase 1) | ❌ |
| Xem danh sách dự án | ✅ all | ✅ assigned only | ✅ assigned only |
| Xem chi tiết dự án | ✅ all | ✅ assigned | ✅ assigned |
| Xem account test | ✅ all envs | ✅ chỉ `allowedEnvs` của mình | ✅ chỉ `allowedEnvs` của mình |
| Thêm / sửa account test | ✅ any env | ✅ trong `allowedEnvs` (phase 1) | ❌ |
| Xóa account test | ✅ any env | ✅ trong `allowedEnvs` (phase 1) | ❌ |
| Gán `allowedEnvs` cho member | ✅ | ✅ (không vượt env của mình) | ❌ |
| Tạo user mới | ✅ | ❌ | ❌ |
| Đổi role user | ✅ | ❌ | ❌ |
| Deactivate user | ✅ | ❌ | ❌ |
| Xem danh sách toàn bộ user | ✅ | ❌ | ❌ |

## Env-level permission — Account Vault

Ngoài phân quyền theo role, mỗi member trong dự án còn có **`allowedEnvs`** — danh sách môi trường được phép xem account test trong dự án đó.

| Điều kiện | Giá trị |
|---|---|
| Default khi add member mới | `['dev']` — chỉ xem dev |
| Có thể grant thêm | `staging`, `production` do SA hoặc Admin phụ trách cấp |
| Super Admin | Luôn thấy cả 3 env, không bị ràng buộc bởi `allowedEnvs` |
| Admin grant cho member | Chỉ grant tối đa những env Admin đó đang có |

**Nguyên tắc**: member thấy env nào → thao tác được trong env đó (nếu role cho phép). Section env không có quyền bị **ẩn hoàn toàn** trên UI — không hiện thông báo "bạn không có quyền".

## Ghi chú về phase 1

- Việc cho Admin **được sửa account test** trong dự án mình phụ trách là quyết định phase 1 — thực tế QC hay báo đổi password, để Admin tự cập nhật cho nhanh thay vì phải gọi Super Admin.
- **Env-level permission** (`allowedEnvs`) implement từ Sprint 04, là cơ chế kiểm soát production account nhạy cảm khỏi member không liên quan.
- Phase 2 có thể tách quyền hơn: tạo role "Account Keeper" riêng hoặc cho phép Super Admin chỉ định ai trong project được edit account.
