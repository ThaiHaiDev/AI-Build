# Sprint 01 — Auth UI · Plan (Business Flow)

> **HOW (nghiệp vụ)** • Status: Draft • Updated: 2026-04-18
> Tech stack/structure xem [FRONTEND.md](../../../FRONTEND.md). File này chỉ mô tả luồng nghiệp vụ.

## Luồng chính (Happy path)

### Flow A — User mới (chưa có tài khoản)

```
[Trang bất kỳ] → click "Đăng ký"
    → /register
    → nhập name + email + password + confirm
    → submit
    → BE tạo account + cấp token
    → auto-login (không bắt nhập lại)
    → redirect /me
    → thấy hồ sơ của mình
```

### Flow B — User đã có tài khoản

```
[Trang bất kỳ] → click "Đăng nhập"
    → /login
    → nhập email + password
    → submit
    → BE verify + cấp token
    → redirect /me (hoặc trang user định vào trước đó)
```

### Flow C — User đăng xuất

```
/me → click "Đăng xuất"
    → clear session client + server
    → redirect /login
    → toast "Đã đăng xuất"
```

---

## State machine của user

```
            ┌─────────────┐
            │  ANONYMOUS  │ ← khởi đầu, hoặc sau logout
            └──────┬──────┘
                   │ (register / login thành công)
                   ▼
            ┌─────────────┐
            │ AUTHENTICATED│ ← có thể vào /me
            └──────┬──────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
   (token        (silent     (logout
    còn hạn)    refresh OK) click)
        │          │          │
        ▼          ▼          ▼
    Tiếp tục   Tiếp tục    ANONYMOUS
                            
            ┌─────────────┐
            │   EXPIRED   │ ← refresh fail / token revoke
            └──────┬──────┘
                   │ (auto trigger)
                   ▼
              ANONYMOUS + toast "Phiên hết hạn"
              + redirect /login?redirect=<path-trước-đó>
```

---

## Decision nghiệp vụ (đã lock)

| # | Câu hỏi | Quyết định | Lý do |
|---|---|---|---|
| D1 | Sau register có auto-login không? | **Có** | Giảm friction, user vừa nhập password rồi |
| D2 | Access token hết hạn → silent refresh hay bắt login lại? | **Silent refresh** | UX mượt, refresh token còn hạn 7 ngày |
| D3 | Refresh fail → xử lý gì? | Logout + redirect `/login` + toast "Phiên hết hạn" | Bảo mật, tránh user thao tác trên session đã chết |
| D4 | Login fail bao nhiêu lần thì khóa? | Theo BE rate limit (đã có) — FE chỉ hiển thị thông báo | Tránh duplicate logic FE/BE |
| D5 | Logout có hỏi confirm không? | **Không** | 1-click, ai bấm nhầm thì login lại |
| D6 | Sai password → tiết lộ "email không tồn tại" hay không? | **Không** — gộp 1 message "Email hoặc mật khẩu không đúng" | Bảo mật, tránh user enumeration |
| D7 | Email lưu phân biệt hoa/thường? | **Không** — luôn lowercase trước khi gửi BE | BE đã lowercase, FE align để consistency UX |
| D8 | "Remember me" checkbox có tác dụng gì? | **UI placeholder ở sprint này** — chưa wire BE. Sprint sau implement long-lived refresh | BE chưa support, không over-promise |
| D9 | User chưa login vào `/me` → redirect đâu? | `/login?redirect=/me`, login xong quay lại đúng `/me` | UX expected behavior |
| D10 | User đã login vào `/login` hoặc `/register` → xử lý gì? | Auto redirect `/me` | Tránh nhầm lẫn, không cho login chồng |

---

## Edge cases nghiệp vụ

### E1 — Mở 2 tab cùng user
- **Tab A logout** → Tab B đang ở `/me`: lần thao tác tiếp theo (gọi API) sẽ nhận 401 → silent refresh fail (cookie đã clear) → tab B cũng bị đẩy về `/login`.
- **Tab A login user X**, tab B vẫn user Y cũ: tab B thao tác tiếp sẽ thấy data của X (vì cookie share). Chấp nhận — không phải use case phổ biến, không xử lý sprint này.

### E2 — User đóng tab giữa chừng đăng ký
- Form chưa submit → mất hết, không lưu draft. (Sprint này không cần draft.)
- Submit thành công nhưng tab close trước khi redirect → lần mở sau, cookie refresh đã có → vào `/login` sẽ tự redirect `/me` (theo D10).

### E3 — Network mất giữa lúc submit
- Hiện toast "Kết nối thất bại, thử lại". Form giữ nguyên data (không reset). User retry.

### E4 — User nhập password rất dài (vd 500 ký tự)
- FE chặn ở 200 ký tự (khớp BE). Vượt → inline error "Mật khẩu tối đa 200 ký tự".

### E5 — Email có ký tự unicode / dấu tiếng Việt
- Cho phép (RFC 5322 cho phép). BE đã handle. FE không chặn.

### E6 — User paste password có space ở đầu/cuối
- **Không trim** — tôn trọng input user (có thể họ cố tình). BE so sánh nguyên xi.

### E7 — Browser autofill
- Phải trigger validation lại sau autofill (không assume field rỗng).

### E8 — Quên đăng xuất trên máy công cộng
- Refresh token TTL 7 ngày — vẫn login được. Out of scope sprint này (sprint sau: "Đăng xuất tất cả thiết bị").

---

## Phụ thuộc

- **Backend**: `/api/auth/{register,login,refresh,logout,me}` đã sẵn sàng (verify ở [01-spec.md](./01-spec.md) → API Contract).
- **Design**: chưa có Figma → dùng ASCII mockup ở `01-spec.md` làm reference.
- **i18n content**: cần PO duyệt wording VN/EN (xem keys trong tasks).

## Không thuộc sprint này (gợi ý sprint sau)

- Forgot password
- Email verification
- Profile edit
- "Đăng xuất tất cả thiết bị" (revoke all refresh tokens)
- Session activity log
- Đổi mật khẩu
