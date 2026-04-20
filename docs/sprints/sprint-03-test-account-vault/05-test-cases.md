# Sprint 03 — Test Account Vault · Test Cases

> Manual test checklist cho QA/PO/dev. Chạy lại mỗi build trước khi đóng sprint.
> Reference: [01-spec.md](./01-spec.md) (US, DoD) · [02-plan.md](./02-plan.md) (decisions D1–D10) · [03-tasks.md](./03-tasks.md).

## Test environment

- Backend: `http://localhost:8000` (local Postgres `aiTest`)
- Frontend: `http://localhost:5173`
- Account seed (tái dùng từ sprint-02):
  - `admin@example.com` / `Admin@12345` — role `SUPER_ADMIN`
  - `leader@example.com` / `Leader@12345` — role `ADMIN`, active member `Project Alpha`
  - `user@example.com` / `User@12345` — role `USER`, active member `Project Alpha`
  - `outsider@example.com` / `Outsider@12345` — role `USER`, không thuộc dự án nào
- Dự án seed: `Project Alpha` (active, có 3 account test seed sẵn — 1 per env), `Project Beta` (active, chưa có account test), `Project Gamma` (archived)
- Reset state giữa các test: F5 + clear cookie / mở incognito

## Quy ước

- **PRE**: precondition
- **Steps**: thao tác
- **Expected**: kết quả mong đợi
- **Maps**: ref US / Edge / Decision / Task

---

## A · Xem tài khoản test (TC-VW)

### TC-VW-01 · Super Admin thấy tab + đủ 3 section
- **PRE**: Login `admin@example.com`, `Project Alpha` có seed 3 account
- **Steps**: Mở `Project Alpha` → click tab "Tài khoản test"
- **Expected**: Thấy 3 section Dev / Staging / Production, mỗi section có 1 card, nút "+ Thêm" xuất hiện ở từng section
- **Maps**: US-07, permission matrix

### TC-VW-02 · Admin in project thấy tab + đủ data
- **PRE**: Login `leader@example.com`
- **Steps**: Mở `Project Alpha` → tab "Tài khoản test"
- **Expected**: Thấy đủ 3 card, có nút "+ Thêm" và "Sửa" / "Xóa" trên card
- **Maps**: US-07, D4

### TC-VW-03 · User in project thấy tab nhưng không thấy nút write
- **PRE**: Login `user@example.com`
- **Steps**: Mở `Project Alpha` → tab "Tài khoản test"
- **Expected**: Thấy đủ 3 card, **không có** nút "+ Thêm", "Sửa", "Xóa"
- **Maps**: US-07, permission matrix

### TC-VW-04 · User ngoài project không truy cập được
- **PRE**: Login `outsider@example.com`
- **Steps**: Paste trực tiếp URL `/projects/<alpha-id>` → tab "Tài khoản test"
- **Expected**: 403, redirect `/projects` + toast "Không có quyền xem dự án này"
- **Maps**: US-07 edge, D10, B32

### TC-VW-05 · Password hiển thị ẩn mặc định
- **PRE**: Login `user@example.com`
- **Steps**: Xem card bất kỳ
- **Expected**: Password hiện `••••••••`, không có nút Reveal (D2)
- **Maps**: D2

### TC-VW-06 · Dự án archived vẫn xem được account
- **PRE**: Login `admin@example.com`, `Project Gamma` archived, có account test
- **Steps**: Bật filter archived → mở `Project Gamma` → tab "Tài khoản test"
- **Expected**: Thấy account, không có nút "+ Thêm" / "Sửa" / "Xóa" (E1)
- **Maps**: US-07 edge, E1, D10

### TC-VW-07 · Empty state khi chưa có account trong section
- **PRE**: Login `admin@example.com`, `Project Beta` chưa có account nào
- **Steps**: Mở `Project Beta` → tab "Tài khoản test"
- **Expected**: Mỗi section hiện "Chưa có tài khoản <env>. Thêm tài khoản mới." + nút "+ Thêm"
- **Maps**: US-07 edge, F24

---

## B · Copy tài khoản test (TC-CP)

### TC-CP-01 · Copy username
- **PRE**: Login `user@example.com`
- **Steps**: Mở `Project Alpha` → tab "Tài khoản test" → click icon copy bên cạnh username của 1 card
- **Expected**: Toast "Đã sao chép" trong ~2 giây; paste vào text editor được giá trị đúng
- **Maps**: US-08, F23

### TC-CP-02 · Copy password
- **Steps**: Click icon copy bên cạnh password (đang hiện `••••••••`)
- **Expected**: Toast "Đã sao chép"; paste ra được password thực (không phải `••••••••`)
- **Maps**: US-08, F23

### TC-CP-03 · Copy URL
- **Steps**: Click icon copy bên cạnh URL
- **Expected**: Toast "Đã sao chép"; giá trị paste ra đúng URL
- **Maps**: US-08, F23

### TC-CP-04 · URL rỗng — nút copy ẩn
- **PRE**: Tạo 1 account không điền URL
- **Steps**: Xem card đó
- **Expected**: Không có icon copy bên cạnh dòng URL (hoặc dòng URL không hiển thị)
- **Maps**: US-08 edge, E4

### TC-CP-05 · Clipboard bị từ chối (fallback)
- **PRE**: DevTools → Application → Permissions → Clipboard denied
- **Steps**: Click icon copy bất kỳ
- **Expected**: Toast "Không thể sao chép, hãy copy thủ công" + text thuần hiện ra để select
- **Maps**: US-08 edge, D9

---

## C · Thêm tài khoản test (TC-CR)

### TC-CR-01 · Super Admin thêm thành công
- **PRE**: Login `admin@example.com`, `Project Beta` chưa có account
- **Steps**: Tab "Tài khoản test" → "+ Thêm" ở section Dev → nhập môi trường=Dev, label="Admin Portal", username="admin_dev", password="P@ssw0rd", URL="https://dev.app.com", ghi chú="full admin rights" → Lưu
- **Expected**: Modal đóng, card mới hiện ở section Dev, toast success
- **Maps**: US-09, F30–F32

### TC-CR-02 · Admin in project thêm thành công
- **PRE**: Login `leader@example.com`
- **Steps**: `Project Alpha` → tab "Tài khoản test" → "+ Thêm" section Staging → điền đủ → Lưu
- **Expected**: Card xuất hiện ở Staging
- **Maps**: US-09, D4

### TC-CR-03 · User in project không thấy nút thêm
- **PRE**: Login `user@example.com`
- **Steps**: `Project Alpha` → tab "Tài khoản test"
- **Expected**: Không thấy nút "+ Thêm" ở bất kỳ section nào
- **Maps**: US-09, permission matrix

### TC-CR-04 · User in project gọi thẳng API → 403
- **PRE**: Login `user@example.com`, lấy token
- **Steps**: `curl POST /api/v1/projects/<alpha-id>/accounts` với token của user
- **Expected**: 403 Forbidden
- **Maps**: US-09, B31

### TC-CR-05 · Label rỗng → inline error
- **Steps**: Mở form → để label trống → nhập username + password → Lưu
- **Expected**: Inline error "Label là bắt buộc", không submit
- **Maps**: US-09 edge

### TC-CR-06 · Username rỗng → inline error
- **Steps**: Label điền, username để trống
- **Expected**: Inline error "Username là bắt buộc"
- **Maps**: US-09 edge

### TC-CR-07 · Password rỗng → inline error
- **Steps**: Label + username điền, password để trống
- **Expected**: Inline error "Password là bắt buộc"
- **Maps**: US-09 edge, E5

### TC-CR-08 · URL sai format → cảnh báo nhẹ nhưng vẫn lưu được
- **Steps**: URL nhập "khong-phai-url" → Lưu
- **Expected**: Hiện cảnh báo nhẹ "URL không hợp lệ" nhưng form vẫn submit; card lưu giá trị nguyên (D8)
- **Maps**: D8

### TC-CR-09 · Không điền URL → vẫn tạo được
- **Steps**: Bỏ trống field URL → Lưu
- **Expected**: Account tạo thành công; card không hiện row URL
- **Maps**: E4

### TC-CR-10 · Network fail
- **PRE**: DevTools → Offline
- **Steps**: Submit form hợp lệ
- **Expected**: Toast "Kết nối thất bại", form giữ nguyên data
- **Maps**: US-09 edge

---

## D · Sửa tài khoản test (TC-ED)

### TC-ED-01 · Super Admin sửa thành công
- **PRE**: Login `admin@example.com`
- **Steps**: Tab "Tài khoản test" → click "Sửa" trên card Dev → đổi password → Lưu
- **Expected**: Modal đóng, card hiển thị password vẫn `••••••••`; copy ra được giá trị mới
- **Maps**: US-10, F33

### TC-ED-02 · Admin in project sửa thành công
- **PRE**: Login `leader@example.com`
- **Steps**: Tương tự TC-ED-01 trên dự án mình thuộc
- **Expected**: Sửa thành công
- **Maps**: US-10, D4

### TC-ED-03 · Admin không thuộc project gọi thẳng API → 403
- **PRE**: Login `leader@example.com`, lấy token. `leader` không phải member `Project Beta`
- **Steps**: `curl PATCH /api/v1/projects/<beta-id>/accounts/<account-id>` với token của leader
- **Expected**: 403 Forbidden
- **Maps**: D4, B31

### TC-ED-04 · accountId không thuộc projectId → 404
- **Steps**: `curl PATCH /api/v1/projects/<alpha-id>/accounts/<beta-account-id>` (id lẫn lộn)
- **Expected**: 404 NotFound
- **Maps**: B32

### TC-ED-05 · Password sửa thành rỗng → chặn
- **Steps**: Mở form sửa → xóa trắng password → Lưu
- **Expected**: Inline error "Password là bắt buộc", không save (E5)
- **Maps**: E5

---

## E · Xóa tài khoản test (TC-DL)

### TC-DL-01 · Super Admin xóa thành công
- **PRE**: Login `admin@example.com`, có account ở Staging
- **Steps**: Click "Xóa" trên card → confirm modal
- **Expected**: Card biến mất, toast success; không thể hoàn tác (D3)
- **Maps**: US-11, F40–F42

### TC-DL-02 · Confirm modal — hủy không xóa
- **Steps**: Click "Xóa" → click "Hủy" trong modal
- **Expected**: Account vẫn còn
- **Maps**: US-11, F41

### TC-DL-03 · Xóa account cuối cùng trong section
- **PRE**: Section Production chỉ còn 1 account
- **Steps**: Xóa account đó
- **Expected**: Section Production hiện empty state
- **Maps**: US-11 edge

### TC-DL-04 · User in project gọi thẳng DELETE API → 403
- **Steps**: `curl DELETE /api/v1/projects/<alpha-id>/accounts/<id>` với token `user@example.com`
- **Expected**: 403 Forbidden
- **Maps**: US-11, B31

---

## F · Auth UI Redesign (TC-AUTH)

### TC-AUTH-01 · AuthLayout split trên desktop
- **Steps**: Mở `/login` ở viewport ≥ 768px
- **Expected**: Layout chia đôi — cột trái form, cột phải dark brand panel
- **Maps**: US-12, U10

### TC-AUTH-02 · AuthLayout mobile — ẩn cột phải
- **Steps**: Viewport 375px, mở `/login`
- **Expected**: Chỉ thấy form, không thấy cột phải; layout không vỡ
- **Maps**: US-12 edge

### TC-AUTH-03 · Mode-switch pill (Login ↔ Register)
- **Steps**: Ở `/login` click tab "Đăng ký" trong AuthCard
- **Expected**: Form chuyển sang RegisterForm trong cùng card (không navigate sang trang khác)
- **Maps**: U11

### TC-AUTH-04 · Password strength indicator khi register
- **Steps**: Vào form đăng ký → gõ password lần lượt: "abc", "abc12345", "Abc12345", "Abc@12345!"
- **Expected**: Indicator đổi level: weak → fair → strong → very strong (4 level theo design)
- **Maps**: U13

### TC-AUTH-05 · Language toggle đúng vị trí + hoạt động
- **Steps**: Mở `/login` → click language toggle
- **Expected**: Toggle hiển thị đúng vị trí theo design; chuyển ngôn ngữ toàn form
- **Maps**: U14

### TC-AUTH-06 · Validation + error state không đổi sau redesign
- **Steps**: Submit form login với email sai, password sai
- **Expected**: Error message, inline error, toast vẫn hiển thị đúng như sprint-01
- **Maps**: US-12 edge

### TC-AUTH-07 · Regression — login / register flow vẫn hoạt động
- **Steps**: Chạy lại TC-LG-01, TC-RG-01 từ sprint-01
- **Expected**: Pass hết (logic không đổi)
- **Maps**: US-12 edge, Q01

---

## G · App Shell Redesign (TC-SHELL)

### TC-SHELL-01 · AppHeader đủ thành phần
- **Steps**: Login bất kỳ → vào `/`
- **Expected**: AppHeader có nav links, search placeholder, language toggle, notifications icon, user menu
- **Maps**: US-13, U20

### TC-SHELL-02 · User menu dropdown
- **Steps**: Click avatar/tên user ở header
- **Expected**: Dropdown mở với menu items; click ra ngoài dropdown đóng lại (E → user menu edge)
- **Maps**: US-13 edge

### TC-SHELL-03 · HomePage — greeting + stats grid
- **Steps**: Login `user@example.com` → `/`
- **Expected**: Greeting "Xin chào, <name>", stats grid 4 card, danh sách projects gần đây + runs gần đây
- **Maps**: US-13, U21

### TC-SHELL-04 · HomePage — empty state khi chưa có data
- **PRE**: Login `outsider@example.com` (không thuộc dự án nào)
- **Steps**: Vào `/`
- **Expected**: Stats grid hiện 0 hoặc empty state nhẹ, không crash
- **Maps**: US-13 edge

### TC-SHELL-05 · MePage — identity strip + info card
- **Steps**: Login bất kỳ → `/me`
- **Expected**: Thấy avatar placeholder, name, email, role badge; info card với các field cá nhân
- **Maps**: US-13, U30

### TC-SHELL-06 · Regression — sprint-02 pages không bị ảnh hưởng
- **Steps**: Login admin → vào `/projects`, mở 1 dự án, tab Thành viên, thêm/gỡ member
- **Expected**: Tất cả flow sprint-02 vẫn hoạt động bình thường
- **Maps**: US-13 edge, Q02

### TC-SHELL-07 · i18n — không có key hardcode sau redesign
- **Steps**: Switch vi ↔ en ở AppHeader, HomePage, MePage
- **Expected**: Không hiện key dạng `home.greeting`, `me.title` — toàn bộ translated
- **Maps**: U22, U31

---

## H · Security & Cross-cutting (TC-SC)

### TC-SC-01 · Rate limit POST account
- **Steps**: Login admin → spam tạo account rất nhanh (> ngưỡng config)
- **Expected**: Trả 429, toast "Thử quá nhiều lần"
- **Maps**: B33

### TC-SC-02 · BE chặn write khi FE gating pass (defense in depth)
- **Steps**: Login `user@example.com` → gọi trực tiếp `POST/PATCH/DELETE /projects/:id/accounts` qua curl
- **Expected**: 403 từ BE
- **Maps**: F50, permission matrix

### TC-SC-03 · Password không log ra server console
- **Steps**: Tạo account test → kiểm tra server log (stdout/pino)
- **Expected**: Không thấy giá trị password plain text trong log (B34)
- **Maps**: B34

### TC-SC-04 · Response không leak credential
- **Steps**: Inspect các API response `/projects/:id/accounts` qua DevTools Network
- **Expected**: Password field trả về đúng giá trị (phase 1 plaintext) nhưng không có field không liên quan (passwordHash, jti, refreshToken)
- **Maps**: Security baseline

### TC-SC-05 · Chưa login → redirect `/login`
- **Steps**: Logout → paste `/projects/<id>` vào URL bar
- **Expected**: Redirect `/login?redirect=/projects/<id>`, login xong về đúng trang
- **Maps**: F51

### TC-SC-06 · Regression sprint-01 auth vẫn OK
- **Steps**: Chạy lại TC-LG-01, TC-LG-03, TC-LO-01, TC-ME-03 từ sprint-01
- **Expected**: Pass hết
- **Maps**: Q07

---

## I · UX (TC-UX)

### TC-UX-01 · Switch VN/EN toàn trang
- **Steps**: Thao tác qua tab "Tài khoản test" → switch ngôn ngữ
- **Expected**: Mọi label, placeholder, toast, error đều đổi; không có key hardcode
- **Maps**: F10, F57

### TC-UX-02 · Responsive mobile — tab Tài khoản test
- **Steps**: Viewport 375px → mở `Project Alpha` → tab "Tài khoản test"
- **Expected**: AccountCard stack đẹp, không scroll ngang, icon copy bấm được bằng ngón tay
- **Maps**: F56

### TC-UX-03 · Loading state khi fetch accounts
- **Steps**: Throttle network Slow 3G → mở tab "Tài khoản test"
- **Expected**: Skeleton hoặc spinner hiển thị trong lúc load
- **Maps**: F55

### TC-UX-04 · Loading state khi submit form
- **Steps**: Throttle Slow 3G → submit form Thêm/Sửa tài khoản
- **Expected**: Nút "Lưu" disabled + "Đang xử lý...", không double submit
- **Maps**: F32

### TC-UX-05 · Keyboard navigation — form account
- **Steps**: Tab qua form Thêm tài khoản, Enter submit
- **Expected**: Focus order hợp lý (môi trường → label → username → password → url → ghi chú → Lưu), Enter submit hoạt động
- **Maps**: DoD

---

## Pass criteria

- Tất cả TC section A–B (xem + copy) **phải pass** trước khi test C–E (CRUD)
- Section H security **bắt buộc pass** để close sprint
- Section F–G (UI Redesign) có thể chạy song song với A–E
- Section I có thể defer qua ngày cuối sprint nếu cần ưu tiên

---

## Sign-off

- [ ] Toàn bộ TC-VW pass
- [ ] Toàn bộ TC-CP pass
- [ ] Toàn bộ TC-CR pass
- [ ] Toàn bộ TC-ED pass
- [ ] Toàn bộ TC-DL pass
- [ ] Toàn bộ TC-AUTH pass
- [ ] Toàn bộ TC-SHELL pass
- [ ] Toàn bộ TC-SC pass
- [ ] TC-UX pass (hoặc ghi rõ deferred item)
- [ ] Tester: ___________  Date: ___________
