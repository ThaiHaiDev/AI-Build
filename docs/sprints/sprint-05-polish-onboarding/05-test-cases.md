# Sprint 05 — History Module + Polish & Onboarding UX · Test Cases

> Manual test checklist cho QA/PO/dev. Chạy lại mỗi build trước khi đóng sprint.
> Reference: [01-spec.md](./01-spec.md) · [02-plan.md](./02-plan.md) · [03-tasks.md](./03-tasks.md)

## Test environment

- Backend: `http://localhost:8000` (local Postgres `aiTest`)
- Frontend: `http://localhost:5173`
- Accounts seed:
  - `admin@example.com` / `Admin@12345` — role `SUPER_ADMIN`
  - `leader@example.com` / `Leader@12345` — role `ADMIN`, active member `Project Alpha` (allowedEnvs: dev, staging)
  - `user@example.com` / `User@12345` — role `USER`, active member `Project Alpha` (allowedEnvs: dev)
  - `newbie@example.com` / `Newbie@12345` — role `USER`, chưa thuộc dự án nào
- Dự án seed: `Project Alpha` (active, có account test 3 env), `Project Beta` (active), `Project Gamma` (archived)

## Quy ước

- **PRE**: precondition
- **Steps**: thao tác
- **Expected**: kết quả mong đợi
- **Maps**: ref US / Decision

---

## A · History Module (TC-HI)

### TC-HI-01 · Tạo account test → entry lịch sử xuất hiện

- **PRE**: Login `leader@example.com`, Project Alpha chưa có account test nào mới hôm nay
- **Steps**: Tab "Tài khoản test" → "+ Thêm" → tạo account "QC Staging 2" / env Staging → submit
- **Expected**: Tab "Lịch sử" (của Project Alpha) có entry mới nhất: actor = leader, action = "Đã tạo", resourceName = "QC Staging 2 – staging", thời gian tương đối
- **Maps**: US-22, A13

### TC-HI-02 · Sửa account test → entry lịch sử ghi đúng before/after

- **PRE**: Login `admin@example.com`, Project Alpha có account "Admin Portal – dev"
- **Steps**: Sửa label thành "Admin Portal v2" → save
- **Expected**: Tab "Lịch sử" có entry: action = "Đã sửa", resourceName = "Admin Portal v2 – dev"; `meta.before.label = "Admin Portal"`, `meta.after.label = "Admin Portal v2"`
- **Maps**: US-22, A13, D-S5-1

### TC-HI-03 · Xóa account test → entry lịch sử ghi đúng

- **PRE**: Login `admin@example.com`, Project Alpha có account "Dev Old"
- **Steps**: Xóa account "Dev Old" → confirm
- **Expected**: Entry: action = "Đã xóa", resourceName = "Dev Old – dev"
- **Maps**: US-22, A13

### TC-HI-04 · Thêm member → lịch sử ghi nhận

- **PRE**: Login `admin@example.com`, Project Alpha
- **Steps**: Tab "Thành viên" → thêm `newbie@example.com` → submit
- **Expected**: Tab "Lịch sử" có entry: resourceType = member, action = "Đã thêm", resourceName = tên newbie
- **Maps**: US-22, A15

### TC-HI-05 · Sửa env access → lịch sử ghi nhận

- **PRE**: Login `admin@example.com`, Project Alpha có member `user@example.com`
- **Steps**: Sửa quyền env của user → thêm staging → save
- **Expected**: Entry: action = "Đã sửa quyền env", `meta.after.allowedEnvs = ["dev", "staging"]`
- **Maps**: US-22, A15

### TC-HI-06 · User không thấy tab Lịch sử

- **PRE**: Login `user@example.com`
- **Steps**: Mở Project Alpha → xem danh sách tab
- **Expected**: Không có tab "Lịch sử"; chỉ có Overview / Members / Tài khoản test
- **Maps**: US-22, D-S5-2

### TC-HI-07 · Admin thấy tab Lịch sử

- **PRE**: Login `leader@example.com`
- **Steps**: Mở Project Alpha → xem danh sách tab
- **Expected**: Có tab "Lịch sử"
- **Maps**: US-22, D-S5-2

### TC-HI-08 · Tab Lịch sử chưa có gì → empty state

- **PRE**: Login `admin@example.com`, Project Beta chưa có action nào
- **Steps**: Mở Project Beta → tab "Lịch sử"
- **Expected**: "Chưa có hoạt động nào." — không blank
- **Maps**: US-22 edge

### TC-HI-09 · SA xem /admin/history toàn hệ thống

- **PRE**: Login `admin@example.com`, đã có nhiều action ở nhiều dự án
- **Steps**: Vào `/admin/history`
- **Expected**: Bảng hiển thị entries từ nhiều dự án khác nhau, bao gồm cả user management actions
- **Maps**: US-23, A21

### TC-HI-10 · Filter /admin/history theo resourceType

- **PRE**: Login `admin@example.com`
- **Steps**: `/admin/history` → filter `resourceType = test_account`
- **Expected**: Chỉ hiện entries có resourceType = test_account; member/user/project không xuất hiện
- **Maps**: US-23, A21

### TC-HI-11 · Filter /admin/history kết hợp nhiều chiều

- **PRE**: Login `admin@example.com`
- **Steps**: Filter `resourceType = test_account` + `action = deleted` + project = "Project Alpha"
- **Expected**: Chỉ hiện entries xóa account test trong Project Alpha
- **Maps**: US-23, A21

### TC-HI-12 · History không có endpoint DELETE

- **PRE**: Biết ID của 1 history entry
- **Steps**: Gọi `DELETE /admin/history/<id>` bằng REST client
- **Expected**: 404 Not Found
- **Maps**: D-S5-3

### TC-HI-13 · History không lưu password trong meta

- **PRE**: Login `admin@example.com`
- **Steps**: Sửa password của account test → kiểm tra meta trong DB hoặc API response
- **Expected**: `meta.before` và `meta.after` không chứa field `password`
- **Maps**: D-S5-1

### TC-HI-14 · SA tạo user → history entry

- **PRE**: Login `admin@example.com`
- **Steps**: `/admin/users` → tạo user mới
- **Expected**: `/admin/history` có entry: resourceType = user, action = "Đã tạo", resourceName = email user mới
- **Maps**: US-23, A16

### TC-HI-15 · Phân trang history

- **PRE**: Có hơn 20 history entries
- **Steps**: `/admin/history` → xem page 1 → next page
- **Expected**: Page 2 hiện, nội dung khác page 1; không crash
- **Maps**: US-23, A21

---

## B · Search & Filter (TC-SR)

### TC-SR-01 · Search project theo tên

- **PRE**: Login `user@example.com`, đang ở /projects
- **Steps**: Gõ "alpha" vào search box
- **Expected**: Sau ~300ms, chỉ thấy "Project Alpha"
- **Maps**: US-24, B10

### TC-SR-02 · Search project theo techStack

- **PRE**: Project Alpha có techStack = "React, Node.js"
- **Steps**: Gõ "react"
- **Expected**: Project Alpha xuất hiện
- **Maps**: US-24, B10

### TC-SR-03 · Search không có kết quả

- **PRE**: Login bất kỳ
- **Steps**: Gõ "xyzabc123"
- **Expected**: Empty state "Không tìm thấy dự án phù hợp với «xyzabc123»"
- **Maps**: US-24, B22

### TC-SR-04 · Clear search trở về full list

- **PRE**: Đang search "alpha"
- **Steps**: Xóa hết text trong search box
- **Expected**: Danh sách đầy đủ quay lại
- **Maps**: US-24

### TC-SR-05 · Search kết hợp filter includeArchived

- **PRE**: Login `admin@example.com`, bật "Show archived"
- **Steps**: Gõ "gamma"
- **Expected**: Project Gamma (archived) xuất hiện
- **Maps**: US-24, B10

### TC-SR-06 · SA search user theo tên

- **PRE**: Login `admin@example.com`, ở `/admin/users`
- **Steps**: Gõ "leader"
- **Expected**: Chỉ thấy user có name/email chứa "leader"
- **Maps**: US-25, B11

### TC-SR-07 · SA search user kết hợp filter role

- **PRE**: Login `admin@example.com`
- **Steps**: Filter Role = "admin" → gõ "example"
- **Expected**: Chỉ user role admin có email chứa "example"
- **Maps**: US-25, B11

---

## C · UX Polish (TC-UX)

### TC-UX-01 · SA thấy section Admin trên sidebar

- **PRE**: Login `admin@example.com`
- **Steps**: Nhìn sidebar
- **Expected**: Thấy section "Admin" với link "Quản lý User" và "Lịch sử"
- **Maps**: US-26, C10

### TC-UX-02 · User/Admin không thấy section Admin trên sidebar

- **PRE**: Login `user@example.com` (test lại với `leader@example.com`)
- **Steps**: Nhìn sidebar
- **Expected**: Không có section Admin, không có link `/admin/*`
- **Maps**: US-26, C10

### TC-UX-03 · User mới chưa có dự án thấy empty state hướng dẫn

- **PRE**: Login `newbie@example.com`
- **Steps**: Vào /projects
- **Expected**: "Bạn chưa được thêm vào dự án nào. Liên hệ leader hoặc SA của bạn."
- **Maps**: US-27, C20

### TC-UX-04 · SA/Admin thấy empty state với nút tạo dự án

- **PRE**: Login `admin@example.com`, không có dự án nào (hoặc filter không khớp)
- **Steps**: Vào /projects → search "zzz"
- **Expected**: Empty state khác: "Chưa có dự án phù hợp." (không phải text user thường)
- **Maps**: US-27, C20

### TC-UX-05 · Skeleton loader hiện khi fetch projects

- **PRE**: Throttle network 3G trong DevTools
- **Steps**: Vào /projects
- **Expected**: Skeleton placeholder trong lúc load, không blank screen
- **Maps**: US-28, C30

### TC-UX-06 · Error boundary bắt crash page

- **PRE**: Dev environment — inject `throw new Error()` vào component
- **Steps**: Vào trang đó
- **Expected**: "Có lỗi xảy ra" + nút "Tải lại trang", không blank
- **Maps**: US-28, C32

### TC-UX-07 · Toast lỗi khi network timeout

- **PRE**: Tắt backend server
- **Steps**: Login rồi vào /projects
- **Expected**: Toast "Không thể kết nối. Vui lòng thử lại." — không im lặng
- **Maps**: US-28, C33

### TC-UX-08 · VaultTab grantedEnvs rỗng → hiện hướng dẫn

- **PRE**: Member có allowedEnvs=[] (edge case — set thủ công qua DB)
- **Steps**: Member đó vào tab Tài khoản test
- **Expected**: "Bạn chưa được cấp quyền xem môi trường nào. Liên hệ Admin của dự án.", không blank
- **Maps**: US-21 edge, C22

---

## D · Regression (TC-REG)

Sau khi ship sprint 05, chạy lại các test case critical từ sprint trước:

- **Sprint 04**: TC vault env — member `allowedEnvs=['dev']` không thấy staging/production
- **Sprint 04**: SA deactivate user → user không login được
- **Sprint 03**: Admin sửa account test bình thường (history fire-and-forget không ảnh hưởng response)
- **Sprint 02**: Project CRUD còn hoạt động đúng
- **Sprint 04**: `ACCOUNT_DEACTIVATED` → auto logout FE
