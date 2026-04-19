# Sprint 02 — Project Management · Test Cases

> Manual test checklist cho QA/PO/dev. Chạy lại mỗi build trước khi đóng sprint.
> Reference: [01-spec.md](./01-spec.md) (US, DoD) · [02-plan.md](./02-plan.md) (decisions D1–D12) · [03-tasks.md](./03-tasks.md).

## Test environment

- Backend: `http://localhost:8000` (local Postgres `aiTest`)
- Frontend: `http://localhost:5173`
- Account seed (sau khi seed sprint-02 chạy):
  - `admin@example.com` / `Admin@12345` — role `SUPER_ADMIN`, được coi là PM/Leader
  - `leader@example.com` / `Leader@12345` — role `ADMIN`, assign vào `Project Alpha`
  - `user@example.com` / `User@12345` — role `USER`, assign vào `Project Alpha`
  - `outsider@example.com` / `Outsider@12345` — role `USER`, không thuộc dự án nào
- Dự án seed: `Project Alpha` (active), `Project Beta` (active), `Project Gamma` (archived)
- Reset state giữa các test: F5 + clear cookie / mở incognito

## Quy ước

- **PRE**: precondition
- **Steps**: thao tác
- **Expected**: kết quả mong đợi
- **Maps**: ref US / Edge / Decision / Task

---

## 0 · Pre-sprint — BE Auth contract fix (TC-BE)

### TC-BE-01 · `/auth/me` trả đủ 6 field, không có `jti`
- **PRE**: Login bất kỳ account, lấy access token
- **Steps**: `curl GET /api/v1/auth/me -H "Authorization: Bearer <token>"`
- **Expected**: Response có đúng `id`, `email`, `name`, `role`, `permissions`, `createdAt`. **Không** có `jti`, `passwordHash`.
- **Maps**: B04, B05, [be-auth-contract-gaps.md](../sprint-01-auth-ui/bugs/be-auth-contract-gaps.md)

### TC-BE-02 · `/auth/register` trả đủ contract mới
- **Steps**: Register account mới qua curl → inspect response
- **Expected**: `{ user: {id,email,name,role,permissions,createdAt}, accessToken }`
- **Maps**: B02, B05

### TC-BE-03 · `/auth/login` trả đủ contract mới
- **Steps**: Login admin qua curl
- **Expected**: Same shape như TC-BE-02
- **Maps**: B03, B05

### TC-BE-04 · `permissions` khớp role
- **Steps**: Login SUPER_ADMIN → `/me`; Login USER → `/me`
- **Expected**: SUPER_ADMIN có đầy đủ permission bao gồm `project:write`, `user:manage`; USER chỉ có permission read cơ bản
- **Maps**: B01

### TC-BE-05 · FE render đầy đủ `/me`
- **PRE**: BE fix xong, FE revert workaround
- **Steps**: Login `admin@example.com`, vào `/me`
- **Expected**: Hiển thị name, email, role, ngày tham gia — không có field trống
- **Maps**: F00, F01

---

## A · List dự án — visibility (TC-LS)

### TC-LS-01 · Super Admin thấy tất cả dự án active
- **PRE**: Login `admin@example.com`
- **Steps**: Vào `/projects`
- **Expected**: Thấy `Project Alpha` + `Project Beta` (Gamma ẩn vì archived), có nút "Tạo dự án"
- **Maps**: US-05, D4

### TC-LS-02 · Admin chỉ thấy dự án được assign
- **PRE**: Login `leader@example.com`
- **Steps**: Vào `/projects`
- **Expected**: Chỉ thấy `Project Alpha`, KHÔNG thấy `Project Beta`. Không có nút "Tạo dự án".
- **Maps**: US-05, permission matrix

### TC-LS-03 · User được assign thấy dự án
- **PRE**: Login `user@example.com`
- **Steps**: Vào `/projects`
- **Expected**: Chỉ thấy `Project Alpha`. Không có nút tạo/sửa/archive.
- **Maps**: US-05

### TC-LS-04 · User không thuộc dự án nào → empty state
- **PRE**: Login `outsider@example.com`
- **Steps**: Vào `/projects`
- **Expected**: Empty state "Bạn chưa thuộc dự án nào. Liên hệ PM/Leader để được add."
- **Maps**: US-05 edge, F34

### TC-LS-05 · Filter xem dự án archive
- **PRE**: Login `admin@example.com`
- **Steps**: Vào `/projects` → tick "Xem dự án đã archive"
- **Expected**: `Project Gamma` hiện ra với badge "Đã archive"
- **Maps**: US-03, F32

### TC-LS-06 · Search theo tên
- **PRE**: Login admin, có ≥ 2 dự án
- **Steps**: Gõ "Alpha" vào ô search
- **Expected**: Chỉ `Project Alpha` hiện trong list
- **Maps**: D12, F33

---

## B · Tạo dự án (TC-CR)

### TC-CR-01 · Happy path
- **PRE**: Login `admin@example.com`
- **Steps**: Click "Tạo dự án" → nhập tên "Project Delta", mô tả, stack "Vue, Go", đối tác → submit
- **Expected**: Modal đóng, dự án mới hiện trong list, toast success
- **Maps**: US-01, F40–F43

### TC-CR-02 · Tên trùng
- **Steps**: Tạo với tên "Project Alpha" (đã tồn tại)
- **Expected**: Inline error "Tên dự án đã tồn tại" ở field tên, dự án không được tạo
- **Maps**: US-01 edge, B31, F43, D5

### TC-CR-03 · Tên rỗng / chỉ space
- **Steps**: Tên "   " + submit
- **Expected**: Inline error "Tên dự án là bắt buộc", submit disabled
- **Maps**: US-01 edge

### TC-CR-04 · Mô tả rất dài (> 2000 ký tự)
- **Steps**: Paste 2500 ký tự vào mô tả
- **Expected**: Counter cảnh báo nhưng vẫn submit được
- **Maps**: US-01 edge

### TC-CR-05 · Non-Super Admin không tạo được
- **PRE**: Login `leader@example.com`
- **Steps**: Thử gọi trực tiếp `POST /api/v1/projects` qua curl với token của leader
- **Expected**: 403 Forbidden
- **Maps**: B20, permission matrix

### TC-CR-06 · Network fail
- **PRE**: DevTools → Offline
- **Steps**: Submit form hợp lệ
- **Expected**: Toast "Kết nối thất bại", form giữ data
- **Maps**: US-01 edge

---

## C · Sửa dự án (TC-ED)

### TC-ED-01 · Super Admin sửa thành công
- **Steps**: Login admin → mở `Project Alpha` → click "Sửa" → đổi mô tả → save
- **Expected**: Detail refresh với mô tả mới, toast success
- **Maps**: US-02, F60–F62

### TC-ED-02 · Sửa trùng tên với dự án khác
- **Steps**: Đổi tên `Project Alpha` thành `Project Beta`
- **Expected**: Inline error "Tên dự án đã tồn tại"
- **Maps**: US-02 edge, B31

### TC-ED-03 · Admin không có nút "Sửa"
- **PRE**: Login `leader@example.com`
- **Steps**: Mở `Project Alpha`
- **Expected**: Không hiện nút "Sửa" (D1)
- **Maps**: D1, permission matrix

### TC-ED-04 · Sửa dự án archived bị chặn
- **PRE**: Login admin
- **Steps**: Bật filter archived → mở `Project Gamma` → thử click "Sửa"
- **Expected**: Nút "Sửa" disabled (D8)
- **Maps**: D8, F60

### TC-ED-05 · Dự án bị xóa/archive giữa chừng
- **PRE**: Tab A đang mở form sửa `Project Alpha`, tab B (admin khác) archive `Project Alpha`
- **Steps**: Tab A submit
- **Expected**: Toast lỗi "Dự án không còn tồn tại/đã archived", redirect `/projects`
- **Maps**: US-02 edge

---

## D · Archive / Un-archive (TC-AR)

### TC-AR-01 · Archive thành công
- **Steps**: Login admin → mở `Project Beta` → click "Archive" → confirm
- **Expected**: Redirect list, `Project Beta` biến mất khỏi list mặc định, hiện khi bật filter archived với badge
- **Maps**: US-03, F70–F72

### TC-AR-02 · Un-archive
- **Steps**: Login admin → bật filter archived → mở `Project Gamma` → click "Khôi phục"
- **Expected**: `Project Gamma` trở lại trạng thái active, hiện ở list mặc định
- **Maps**: US-03

### TC-AR-03 · Confirm modal cho archive
- **Steps**: Click "Archive" không confirm (click Hủy)
- **Expected**: Dự án vẫn active
- **Maps**: F71

### TC-AR-04 · Admin / User không thấy nút archive
- **PRE**: Login leader hoặc user
- **Steps**: Mở dự án mình thuộc
- **Expected**: Không có nút "Archive"
- **Maps**: Permission matrix

### TC-AR-05 · Member vẫn xem được dự án archived
- **PRE**: Login `user@example.com`, `Project Gamma` archived nhưng user là member
- **Steps**: Bật filter archived → mở Gamma
- **Expected**: Xem được chi tiết với badge "Đã archive", không có nút sửa/thêm member
- **Maps**: D7, D8

---

## E · Gán / gỡ member (TC-MB)

### TC-MB-01 · Super Admin thêm member
- **Steps**: Login admin → `Project Beta` → tab "Thành viên" → "+ Thêm" → search `outsider@example.com` → chọn → confirm
- **Expected**: Outsider xuất hiện trong list member, toast success
- **Maps**: US-04, F80–F83

### TC-MB-02 · User mới được add thấy dự án ngay
- **PRE**: Làm xong TC-MB-01, `outsider@example.com` đang login ở browser khác, đang ở `/projects`
- **Steps**: Outsider refresh `/projects`
- **Expected**: `Project Beta` hiện ra trong list (D9, không cần logout)
- **Maps**: D9, Flow A

### TC-MB-03 · Gỡ member — real-time enforcement
- **PRE**: `user@example.com` đang ở `/projects/<alpha-id>` tab "Thành viên"
- **Steps**: Admin ở browser khác → gỡ user khỏi `Project Alpha` → user click refresh hoặc click tab khác
- **Expected**: Request trả 403 → redirect `/projects` + toast "Không có quyền xem dự án này"
- **Maps**: US-04, D10, Flow C, Q04

### TC-MB-04 · Không thêm trùng member
- **Steps**: Admin mở modal thêm member `Project Alpha` → `user@example.com` đã là member
- **Expected**: `user@example.com` disable trong dropdown với tooltip "Đã là thành viên"
- **Maps**: US-04 edge, F82

### TC-MB-05 · Search user trong modal
- **Steps**: Gõ "lead" vào search box
- **Expected**: Chỉ hiện các user có email/tên match "lead" (debounced, không spam request)
- **Maps**: F82, B29

### TC-MB-06 · Empty state search
- **Steps**: Gõ string không match user nào
- **Expected**: "Không tìm thấy user"
- **Maps**: F82

### TC-MB-07 · Gỡ chính mình (Super Admin)
- **PRE**: Admin là member của `Project Alpha`
- **Steps**: Admin gỡ chính mình → refresh
- **Expected**: Vẫn thấy `Project Alpha` trong list (vì role SUPER_ADMIN)
- **Maps**: D11

### TC-MB-08 · Admin / User không thấy nút thêm/gỡ
- **PRE**: Login `leader@example.com`
- **Steps**: Mở `Project Alpha` → tab "Thành viên"
- **Expected**: Thấy list member nhưng không có nút "+ Thêm" / icon "×" (D1)
- **Maps**: D1, permission matrix

---

## F · Chi tiết dự án & bảo mật URL (TC-DT)

### TC-DT-01 · Member xem được chi tiết
- **PRE**: Login `user@example.com`
- **Steps**: Mở `Project Alpha`
- **Expected**: Thấy mô tả, stack, đối tác, list member với role
- **Maps**: US-06

### TC-DT-02 · Truy cập URL dự án không thuộc → 403
- **PRE**: Login `outsider@example.com`
- **Steps**: Paste URL `/projects/<alpha-id>` vào address bar
- **Expected**: Request trả 403, redirect `/projects` + toast "Không có quyền xem dự án này"
- **Maps**: US-06 edge, B32, F52, Q05

### TC-DT-03 · Dự án không tồn tại → 404
- **Steps**: Paste `/projects/00000000-0000-0000-0000-000000000000`
- **Expected**: Page NotFound
- **Maps**: US-06 edge, F53

### TC-DT-04 · Chưa login → redirect `/login`
- **Steps**: Logout → paste `/projects` vào URL
- **Expected**: Redirect `/login?redirect=/projects`, login xong quay lại
- **Maps**: F91

---

## G · Security & regression (TC-SC)

### TC-SC-01 · Rate limit POST /projects
- **Steps**: Login admin → spam tạo dự án rất nhanh (> 10 request/phút)
- **Expected**: Sau threshold trả 429, toast "Thử quá nhiều lần"
- **Maps**: B33

### TC-SC-02 · BE chặn cả khi FE gating pass
- **Steps**: Login `leader@example.com` → gọi trực tiếp `POST /projects` / `DELETE /projects/:id/members/:userId` qua curl
- **Expected**: 403 từ BE (defense in depth)
- **Maps**: F90, permission matrix

### TC-SC-03 · Auth contract không regress
- **Steps**: Sau khi B02–B04 merge, re-run toàn bộ TC sprint-01 (login/register/me/logout)
- **Expected**: Pass hết
- **Maps**: Q06

### TC-SC-04 · Response không leak secret
- **Steps**: Inspect mọi response `/projects*` và `/users*` qua DevTools Network
- **Expected**: Không có `passwordHash`, `refreshToken`, `jti` ở bất kỳ payload nào
- **Maps**: B05

---

## H · i18n & UX (TC-UX)

### TC-UX-01 · Switch VN/EN
- **Steps**: Đổi ngôn ngữ → thao tác toàn bộ flow
- **Expected**: Không có key i18n hardcode hiển thị (vd `projects.create.title`)
- **Maps**: F10, F98

### TC-UX-02 · Responsive mobile
- **Steps**: Mở DevTools responsive 375×667 → chạy flow tạo dự án + thêm member
- **Expected**: UI không vỡ, modal scrollable
- **Maps**: F95

### TC-UX-03 · Loading state
- **Steps**: Throttle network slow 3G → submit form tạo dự án
- **Expected**: Button disabled + text "Đang xử lý...", không double submit
- **Maps**: F97

### TC-UX-04 · Keyboard navigation
- **Steps**: Tab qua form tạo dự án, Enter submit
- **Expected**: Focus order hợp lý, Enter không gây double submit
- **Maps**: F96

---

## Pass criteria

- Tất cả TC ở section 0 (BE fix) **phải pass trước khi chạy** section A–H
- Section G security **bắt buộc pass** để close sprint
- Section H có thể defer qua polish ngày cuối sprint nếu cần ưu tiên
