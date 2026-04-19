# Modules

> **WHAT** • Status: Draft • Owner: @haidz1004 • Created: 2026-04-19

Mô tả các module nghiệp vụ chính. Không bao gồm chi tiết kỹ thuật (API, schema, component) — chi tiết đó thuộc về sprint spec/plan.

---

## Module 1 — Project Management

### Mô tả

Quản lý danh mục dự án của công ty. Super Admin là người duy nhất có quyền CRUD.

### Thông tin của một dự án

- **Tên dự án** (bắt buộc)
- **Mô tả dự án** (mô tả ngắn về business, customer là ai, giải quyết vấn đề gì)
- **Công nghệ / Tech stack** (free text hoặc tag, vd: "React, Node.js, Postgres, AWS")
- **Thông tin đối tác** (tên công ty đối tác, người liên hệ chính, email/phone — không bắt buộc)
- **Danh sách member** (các user được gán vào dự án, mỗi user có 1 role trong dự án — xem phần Membership)
- **Trạng thái** (active / archived — xem Open Questions)

### Chức năng

- Super Admin tạo / sửa / xóa (hoặc archive) dự án
- Super Admin gán / gỡ member vào dự án
- Mọi user (SUPER_ADMIN/ADMIN/USER) xem danh sách dự án — nhưng chỉ thấy dự án mình được gán (Super Admin thấy tất cả)

### Membership

- **Many-to-many**: 1 user thuộc nhiều dự án, 1 dự án có nhiều user
- Thông tin membership tối thiểu: user nào + dự án nào + ngày được add
- Khi user bị gỡ khỏi dự án → mất quyền xem dự án đó ngay lập tức (phiên login hiện tại phải check lại quyền ở mỗi request nhạy cảm)

### Recommendation

- Mỗi dự án nên có thêm 1 **project code ngắn** (vd `PRJ-ABC`, `PRJ-XYZ`) để dễ reference trong chat, Jira, ticket. Ghi nhận làm open question (xem 05-open-questions).

---

## Module 2 — Test Account Vault

### Mô tả

Với mỗi dự án, lưu trữ các account test dùng để truy cập hệ thống của dự án đó ở 3 môi trường.

### Cấu trúc

- Mỗi dự án có 3 nhóm account, phân theo môi trường:
  - **Development (dev)**
  - **Staging**
  - **Production**
- Mỗi nhóm có **không giới hạn số lượng** account (một dự án có thể có nhiều account test dev cho nhiều role khác nhau: QC account, admin account, demo account, v.v.)

### Thông tin một account test

- **Label** (bắt buộc, ví dụ: "QC account 1", "Admin demo", "Customer test")
- **Username / Email** (bắt buộc)
- **Password** (bắt buộc)
- **URL môi trường** (URL để login vào, ví dụ `https://staging.project-abc.com`)
- **Ghi chú** (optional: role của account trong hệ thống của dự án, hạn chế gì, ai tạo)

### Chức năng

- Super Admin: CRUD mọi account test của mọi dự án
- Admin (trong dự án): CRUD account test của dự án mình phụ trách
- User (trong dự án): chỉ xem (bao gồm xem password) và copy

### Bảo mật — phase 1 (đã chọn)

- **Plaintext lưu trong DB**, chỉ kiểm soát truy cập bằng:
  - Authentication (phải login)
  - Authorization: role + project membership
- **Rủi ro chấp nhận**: nếu DB leak → toàn bộ account test lộ
- **Mark as tech debt**, phase 2 bắt buộc nâng cấp

### Bảo mật — phase 2 (roadmap)

- Encrypted-at-rest (pgcrypto ở DB hoặc column-level encryption ở application)
- Mask password mặc định, nút "Reveal" mới decrypt
- Audit log: ai reveal account nào khi nào

---

## Module 3 — User Management

### Mô tả

Quản lý tài khoản người dùng của hệ thống. Super Admin là người duy nhất có quyền quản lý.

### Cách tạo user

Hai đường tạo user:

1. **Self-register** (đã có từ sprint-01): user tự vào `/register` → tạo account → role mặc định là `USER`
2. **Super Admin tạo** (sprint-04): Super Admin tạo user thay cho nhân viên mới, có thể chỉ định role luôn

### Chức năng dành cho Super Admin

- Xem danh sách toàn bộ user (email, tên, role, ngày tạo, trạng thái active/deactivated)
- Filter user theo role, theo dự án đang thuộc
- Đổi role user (vd: nâng `USER` → `ADMIN` khi được làm Dev Lead)
- Deactivate user (khi nhân viên rời công ty — không xóa cứng, để giữ history membership)
- Xem user thuộc những dự án nào

### Chức năng dành cho User thường

- Xem và cập nhật thông tin cá nhân của mình (tên, password)
- Xem danh sách dự án mình được gán

### Recommendation

- **Invite flow thay vì Super Admin tự tạo password**: khi Super Admin tạo user mới, hệ thống gửi link set-password qua email, user click link và tự đặt password. An toàn hơn và đỡ việc cho Super Admin. Ghi nhận làm open question.
