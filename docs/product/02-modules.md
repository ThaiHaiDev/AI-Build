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
- Thông tin membership: user nào + dự án nào + ngày được add + **`allowedEnvs`** (xem Module 2)
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

### Phân quyền theo môi trường (Env-level Permission)

Ngoài phân quyền theo role, hệ thống còn kiểm soát **từng member chỉ được xem môi trường nào** trong dự án đó. Cơ chế này tách biệt với role (Admin/User) — đây là lớp phân quyền thứ hai chồng lên role.

- Mỗi membership lưu thêm `allowedEnvs`: danh sách môi trường được phép (`dev`, `staging`, `production`)
- **Default khi add member**: `['dev']` — chỉ xem dev, phải chủ động grant thêm
- **Super Admin**: luôn thấy cả 3 môi trường, không bị giới hạn bởi `allowedEnvs`
- **Admin / User**: chỉ thấy (và thao tác) trong các môi trường thuộc `allowedEnvs` của mình
- Section môi trường không có quyền bị **ẩn hoàn toàn** trên UI

Ai được thay đổi `allowedEnvs`:
- Super Admin: có thể grant bất kỳ env nào cho bất kỳ member nào
- Admin (in project): có thể grant env cho member khác, nhưng không được grant env vượt quá `allowedEnvs` của chính mình

### Chức năng

- Super Admin: CRUD mọi account test của mọi dự án, mọi môi trường
- Admin (trong dự án): CRUD account test trong các môi trường thuộc `allowedEnvs` của mình
- User (trong dự án): chỉ xem và copy, trong các môi trường thuộc `allowedEnvs` của mình

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

### Lịch sử thay đổi account test

Mỗi thao tác **tạo / sửa / xóa** account test được ghi vào module History (Module 4). Người dùng có thể xem ai đã đổi password, thêm account, hoặc xóa account trong dự án — phục vụ truy vết khi có sự cố.

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

---

## Module 4 — History (Lịch sử thay đổi)

### Mô tả

Một bảng lịch sử tập trung (`History`) ghi lại mọi thao tác tạo / sửa / xóa trên các resource quan trọng. Được filter theo `resourceType` để xem lịch sử của từng loại đối tượng riêng.

### Các loại lịch sử (`resourceType`)

| Type | Mô tả |
|------|-------|
| `test_account` | Tạo / sửa / xóa account test |
| `project` | Tạo / sửa thông tin / archive / unarchive dự án |
| `member` | Thêm / gỡ member, thay đổi `allowedEnvs` |
| `user` | SA tạo user, đổi role, deactivate |

### Thông tin một entry lịch sử

- **Actor**: ai thực hiện (tên + email)
- **Action**: loại thao tác (`created`, `updated`, `deleted`, `archived`, v.v.)
- **Resource type + ID + tên snapshot**: đối tượng bị tác động (tên tại thời điểm thao tác)
- **Project** (nếu có): dự án liên quan
- **Meta / Diff**: dữ liệu trước và sau khi thay đổi (không lưu password/token)
- **Thời gian**: timestamp

### Phân quyền xem lịch sử

| Ai | Xem được gì |
|----|-------------|
| Super Admin | Toàn bộ history mọi loại, mọi dự án |
| Admin (member dự án) | History của dự án mình (test_account + member), không thấy user history |
| User (member dự án) | **Không** xem được history |

### Điểm truy cập trên UI

- **Tab "Lịch sử"** trong `ProjectDetailPage`: lịch sử của `test_account` + `member` thuộc dự án đó
- **Trang `/admin/history`** (SA only): toàn bộ history, filter theo type / actor / dự án / date range

### Nguyên tắc vận hành

- **Append-only**: không có endpoint xóa history
- **Fire-and-forget**: ghi log không chặn response chính — nếu ghi thất bại chỉ log lỗi nội bộ
- **Không lưu sensitive data**: password, token, PII ngoài tên + email actor
