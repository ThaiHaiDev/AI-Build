# User Flows

> **HOW (business)** • Status: Draft • Owner: @haidz1004 • Created: 2026-04-19

Mô tả luồng nghiệp vụ dưới dạng narrative. Không bao gồm chi tiết kỹ thuật (endpoint, component) — chi tiết đó thuộc sprint spec.

---

## Flow A — Onboard nhân viên mới

**Actor**: Super Admin → User mới

1. Công ty tuyển 1 dev mới, tên là An, được assign vào 2 dự án đang chạy: `Project Alpha` và `Project Beta`.
2. Super Admin vào hệ thống, tạo tài khoản cho An (email, tên, role = `USER`).
3. Super Admin mở `Project Alpha` → thêm An vào danh sách member. Lặp lại với `Project Beta`.
4. An nhận thông tin tài khoản → login lần đầu → thấy dashboard có 2 dự án.
5. An click vào `Project Alpha` → thấy:
   - Mô tả dự án, tech stack, đối tác
   - Danh sách account test 3 môi trường (dev/staging/production)
   - Danh sách member của dự án
6. An copy account test dev → tự login vào hệ thống của Project Alpha → bắt đầu làm việc.

**Outcome**: An tự onboard xong mà không cần hỏi ai.

---

## Flow B — Super Admin thêm dự án mới

**Actor**: Super Admin

1. Công ty ký hợp đồng dự án mới `Project Gamma`.
2. Super Admin vào hệ thống → tạo dự án mới:
   - Nhập tên, mô tả, tech stack, thông tin đối tác
3. Super Admin thêm account test cho dự án:
   - Chọn môi trường `dev` → thêm account "QC account 1" + username + password + URL
   - Chọn môi trường `staging` → thêm account tương tự
   - Chọn môi trường `production` → thêm account tương tự (nếu có)
4. Super Admin assign Dev Lead (role `ADMIN`) phụ trách kỹ thuật dự án.
5. Super Admin assign các dev/QC (role `USER`) vào dự án.
6. Các member được assign login → thấy dự án mới trong danh sách.

**Outcome**: Dự án mới đi vào vận hành, không ai phải spam chat xin account.

---

## Flow C — Admin cập nhật account test

**Actor**: Admin (Dev Lead của dự án)

1. QC báo password account test staging bị đổi.
2. Dev Lead login → vào dự án mình phụ trách → mở mục account test staging → tìm account cần sửa.
3. Cập nhật password mới → save.
4. Tất cả member trong dự án thấy password mới ngay lần xem kế tiếp.

**Outcome**: Khỏi cần reach Super Admin, cập nhật nhanh.

---

## Flow D — User xem account test

**Actor**: User (nhân viên thường trong dự án)

1. Dev đang test feature mới, cần account staging.
2. Login → chọn dự án → mở tab account test `staging` → thấy danh sách account.
3. Click account → xem username, password, URL → copy.
4. Dùng account để login vào hệ thống của dự án.

**Outcome**: < 30 giây để có account test.

---

## Flow E — User bị gỡ khỏi dự án

**Actor**: Super Admin → User cũ

1. Nhân viên Bình chuyển sang dự án khác / nghỉ việc.
2. Super Admin vào dự án cũ của Bình → gỡ Bình khỏi member list.
3. **Ngay lập tức**: nếu Bình đang login và đang xem dự án đó, lần thao tác kế tiếp (refresh, click menu) sẽ nhận lỗi "Không có quyền" và bị kick khỏi trang dự án.
4. Dashboard của Bình không còn hiển thị dự án đó nữa.

**Lưu ý nghiệp vụ**: việc gỡ quyền phải có hiệu lực ngay — không chờ đến khi user logout hoặc token hết hạn.

**Outcome**: Khi nhân viên rời dự án, quyền xem account test cũng mất theo.

---

## Flow F — User tự đăng ký (đã có từ sprint-01)

**Actor**: Anonymous visitor

1. User vào `/register` → điền email, tên, password → submit.
2. Hệ thống tạo account, role mặc định là `USER`, auto login.
3. User thấy dashboard **rỗng** (chưa được assign dự án nào).
4. User liên hệ Super Admin để được add vào dự án phù hợp.

**Outcome**: Có account nhưng chưa thấy gì cho đến khi được assign.

---

## Flow G — Super Admin deactivate user

**Actor**: Super Admin

1. Nhân viên nghỉ việc.
2. Super Admin vào module User Management → tìm user → deactivate.
3. User bị logout forced ở mọi phiên. Các lần login sau đều bị từ chối.
4. User không bị xóa cứng — lịch sử membership của user trong các dự án cũ vẫn được lưu (phục vụ audit sau này).

**Outcome**: Off-boarding sạch, không mất data lịch sử.
