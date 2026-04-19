# Sprint 01 — Auth UI · Test Cases

> Manual test checklist cho QA/PO/dev. Chạy lại mỗi build trước khi đóng sprint.
> Reference: [01-spec.md](./01-spec.md) (US, edge cases) · [02-plan.md](./02-plan.md) (decisions D1–D10).

## Test environment

- Backend: `http://localhost:8000` (local Postgres `aiTest`)
- Frontend: `http://localhost:5173`
- Account seed sẵn:
  - `admin@example.com` / `Admin@12345` (role: admin)
  - `user@example.com` / `User@12345` (role: user)
- Account register mới mỗi run: `qa+<timestamp>@example.com` / `Qa@12345678`
- Reset state giữa các test: F5 + clear cookie / mở incognito

## Quy ước

- **PRE**: precondition
- **Steps**: thao tác user
- **Expected**: kết quả mong đợi
- **Maps**: ref US/Edge/Decision

---

## A · Register (TC-RG)

### TC-RG-01 · Happy path
- **PRE**: Chưa login, email chưa tồn tại
- **Steps**: 1) Vào `/register` 2) Nhập name "QA Tester", email mới, password "Qa@12345678", confirm khớp 3) Click "Đăng ký"
- **Expected**: Account tạo thành công, auto-login, redirect `/me`, thấy info vừa register
- **Maps**: US-01, D1

### TC-RG-02 · Email đã tồn tại
- **PRE**: Email `user@example.com` đã có
- **Steps**: Submit form với email đó
- **Expected**: Toast "Email đã được sử dụng", form giữ data, không redirect
- **Maps**: US-01 edge

### TC-RG-03 · Email sai format
- **Steps**: Lần lượt nhập "abc", "abc@", "a b@x.com", chuỗi 321 ký tự
- **Expected**: Inline error "Email không hợp lệ", submit button disabled
- **Maps**: US-01 edge

### TC-RG-04 · Password < 8 ký tự
- **Steps**: Nhập password "Abc@1"
- **Expected**: Inline error "Mật khẩu phải ít nhất 8 ký tự"
- **Maps**: US-01 edge

### TC-RG-05 · Confirm không khớp
- **Steps**: password "Qa@12345678", confirm "Qa@99999999"
- **Expected**: Inline error "Mật khẩu nhập lại không khớp", submit disabled
- **Maps**: US-01 edge

### TC-RG-06 · Name rỗng / chỉ space
- **Steps**: Nhập name "   "
- **Expected**: Inline error "Họ tên là bắt buộc" (sau trim)
- **Maps**: US-01 edge

### TC-RG-07 · Network fail
- **PRE**: Tắt network (DevTools → Offline)
- **Steps**: Submit form hợp lệ
- **Expected**: Toast "Kết nối thất bại, thử lại", form giữ nguyên data
- **Maps**: US-01 edge E3

### TC-RG-08 · Double-click submit
- **Steps**: Click "Đăng ký" 2 lần liên tiếp rất nhanh
- **Expected**: Chỉ 1 request gửi đi, button disabled + text "Đang xử lý..." từ click đầu
- **Maps**: US-01 edge

---

## B · Login (TC-LG)

### TC-LG-01 · Happy path admin
- **Steps**: Login `admin@example.com` / `Admin@12345`
- **Expected**: Redirect `/me`, role hiển thị "admin"
- **Maps**: US-02

### TC-LG-02 · Happy path user
- **Steps**: Login `user@example.com` / `User@12345`
- **Expected**: Redirect `/me`, role hiển thị "user"
- **Maps**: US-02

### TC-LG-03 · Sai password
- **Steps**: `user@example.com` / `WrongPassword`
- **Expected**: Toast "Email hoặc mật khẩu không đúng", không tiết lộ field nào sai
- **Maps**: US-02 edge, D6

### TC-LG-04 · Email không tồn tại
- **Steps**: `notexist@example.com` / `Anything@123`
- **Expected**: Toast giống TC-LG-03 (cùng message — security)
- **Maps**: US-02 edge, D6

### TC-LG-05 · Rate limit
- **Steps**: Submit sai password 6+ lần liên tiếp
- **Expected**: Đến lần thứ N (theo BE config) toast đổi thành "Thử quá nhiều lần, đợi 1 phút"
- **Maps**: US-02 edge, D4

### TC-LG-06 · Đã login vào /login
- **PRE**: Đã login user
- **Steps**: Truy cập `/login`
- **Expected**: Auto redirect `/me`, không thấy form login
- **Maps**: US-02 edge, D10

### TC-LG-07 · Redirect query
- **PRE**: Chưa login
- **Steps**: 1) Vào `/me` → bị đẩy về `/login?redirect=/me` 2) Login đúng
- **Expected**: Sau login redirect đúng `/me` (không phải mặc định)
- **Maps**: US-02, D9

---

## C · /me (TC-ME)

### TC-ME-01 · Hiển thị đủ field
- **PRE**: Login user
- **Steps**: Vào `/me`
- **Expected**: Thấy: avatar (initial), tên, email, role badge, ngày tham gia, nút "Đăng xuất"
- **Maps**: US-03

### TC-ME-02 · Chưa login → redirect
- **PRE**: Chưa login (clear cookie + storage)
- **Steps**: Truy cập trực tiếp `/me`
- **Expected**: Redirect `/login?redirect=/me`
- **Maps**: US-03 edge, D9

### TC-ME-03 · Silent refresh khi token hết hạn
- **PRE**: Login user, đợi access token hết hạn (hoặc set TTL ngắn để test) — refresh cookie còn hạn
- **Steps**: Thao tác trên `/me` (vd: F5)
- **Expected**: Silent refresh chạy ngầm, page tiếp tục bình thường, không bị đẩy về login
- **Maps**: US-03 edge, D2

### TC-ME-04 · Refresh fail → logout
- **PRE**: Login, sau đó xóa refresh cookie thủ công (DevTools), hết hạn access token
- **Steps**: Thao tác trên /me
- **Expected**: Toast "Phiên hết hạn", redirect `/login?redirect=/me`
- **Maps**: US-03 edge, D3

### TC-ME-05 · Format ngày theo locale
- **Steps**: Switch i18n vi → ngày kiểu `dd/mm/yyyy`. Switch en → kiểu `MMM dd, yyyy`
- **Expected**: Định dạng đổi đúng theo locale
- **Maps**: US-03

---

## D · Logout (TC-LO)

### TC-LO-01 · Logout thành công
- **PRE**: Login user
- **Steps**: Vào `/me`, click "Đăng xuất"
- **Expected**: Redirect `/login`, toast "Đã đăng xuất", cookie refresh bị xóa
- **Maps**: US-04, D5

### TC-LO-02 · Sau logout không vào được /me
- **Steps**: Tiếp ngay sau TC-LO-01, gõ URL `/me`
- **Expected**: Redirect `/login?redirect=/me`
- **Maps**: US-04

### TC-LO-03 · Multi-tab logout
- **PRE**: Mở 2 tab cùng login user, cùng ở `/me`
- **Steps**: 1) Tab A click "Đăng xuất" 2) Quay sang Tab B, F5 hoặc click thao tác gọi API
- **Expected**: Tab B nhận 401, silent refresh fail (cookie đã clear), bị đẩy về `/login`
- **Maps**: US-04 edge, E1

---

## E · Cross-cutting (TC-CC)

### TC-CC-01 · Responsive 375px (mobile)
- **Steps**: DevTools set viewport 375px, mở `/login`, `/register`, `/me`
- **Expected**: Form full-width, padding hợp lý, không scroll ngang, button bấm được bằng ngón tay
- **Maps**: DoD

### TC-CC-02 · Responsive 768px (tablet)
- **Steps**: Viewport 768px
- **Expected**: Form center, không quá rộng (max ~480px), spacing đẹp

### TC-CC-03 · Responsive 1024px+ (desktop)
- **Steps**: Viewport 1280px
- **Expected**: Form center, layout cân đối, logo + form không bị lệch

### TC-CC-04 · Switch i18n vi ↔ en
- **Steps**: Toggle ngôn ngữ ở mọi page (login/register/me)
- **Expected**: Mọi label, placeholder, button, error, toast đều đổi. Không còn từ tiếng Anh trong vi (và ngược lại)
- **Maps**: DoD

### TC-CC-05 · Browser autofill
- **PRE**: Cho Chrome lưu credential 1 lần (login OK lần đầu)
- **Steps**: Lần sau vào `/login`, để Chrome autofill, click submit
- **Expected**: Validation pass (không báo field rỗng), login thành công
- **Maps**: E7

### TC-CC-06 · Password có space đầu/cuối
- **Steps**: Register password " Qa@12345678 " (có space). Sau đó login lại với password đúng " Qa@12345678 "
- **Expected**: Login OK (không trim — D-equivalent E6). Login với "Qa@12345678" (không space) → fail
- **Maps**: E6

### TC-CC-07 · Email tiếng Việt có dấu
- **Steps**: Register email `nguyễn@example.com`
- **Expected**: BE chấp nhận, tạo account OK, login lại được
- **Maps**: E5

### TC-CC-08 · Tab navigation
- **Steps**: Ở `/login`, dùng phím Tab để di chuyển focus
- **Expected**: Focus order: email → password → eye-toggle → remember → submit → link "Đăng ký". Không bị skip element

### TC-CC-09 · Screen reader
- **Steps**: Bật NVDA/VoiceOver, navigate form login
- **Expected**: Đọc đúng label field, đọc error message khi có, button có aria-label rõ
- **Maps**: DoD a11y ≥ 90

---

## Sign-off

- [ ] Toàn bộ TC-RG pass
- [ ] Toàn bộ TC-LG pass
- [ ] Toàn bộ TC-ME pass
- [ ] Toàn bộ TC-LO pass
- [ ] Toàn bộ TC-CC pass
- [ ] Tester: ___________  Date: ___________
