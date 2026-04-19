# Sprint 01 — Auth UI · Tasks

> **Atomic checklist** • Status: Draft • Updated: 2026-04-18
> Mỗi task ≤ 30 phút. Tick `[x]` khi xong. Liên kết commit ở `04-history.md`.

## Pre-sprint

- [ ] T00 · Init FE project theo [FRONTEND.md](../../../FRONTEND.md) (chỉ làm 1 lần đầu)

## Foundation

- [ ] T01 · Setup i18n VN/EN, namespace `auth`, đủ key theo wording đã duyệt
- [ ] T02 · Setup auth state (lưu user + token client-side, clear khi logout)
- [ ] T03 · Setup HTTP layer: gắn token, auto refresh khi 401, redirect login khi refresh fail
- [ ] T04 · Setup routing: phân biệt route public / chỉ-cho-guest / chỉ-cho-user-đã-login

## US-01 · Register

- [ ] T05 · Page `/register` layout theo mockup
- [ ] T06 · Form Register: 4 field (name, email, password, confirm) với validation khớp BE
- [ ] T07 · Wire submit → API register → auto-login → redirect `/me`
- [ ] T08 · Handle lỗi nghiệp vụ: email tồn tại, validation, network

## US-02 · Login

- [ ] T09 · Page `/login` layout theo mockup
- [ ] T10 · Form Login: 3 field (email, password, remember) — remember chỉ UI
- [ ] T11 · Wire submit → API login → redirect `/me` hoặc `?redirect=`
- [ ] T12 · Handle lỗi nghiệp vụ: sai credential (gộp message), rate limit, network
- [ ] T13 · Auto redirect `/me` nếu user đã login mà vào `/login`

## US-03 · /me

- [ ] T14 · Page `/me` layout theo mockup, hiển thị user info
- [ ] T15 · Bảo vệ route: chưa login → redirect `/login?redirect=/me`
- [ ] T16 · Format ngày tham gia theo locale hiện tại (vi-VN / en-US)

## US-04 · Logout

- [ ] T17 · Nút "Đăng xuất" ở `/me`
- [ ] T18 · Wire click → API logout → clear state → redirect `/login` + toast

## Polish

- [ ] T19 · Responsive check 3 breakpoint (mobile / tablet / desktop)
- [ ] T20 · A11y: label, aria-invalid, focus order, keyboard navigation
- [ ] T21 · Loading state: button disabled + text "Đang xử lý..." khi submit
- [ ] T22 · Test thủ công full 4 flow với 3 account (admin, user, register mới)
- [ ] T23 · Cleanup: xóa console.log, kiểm tra i18n không còn hardcode string

## Sprint close

- [ ] T24 · Update `04-history.md` lần cuối với summary
- [ ] T25 · Tag git `sprint-01-auth-ui-done`
- [ ] T26 · Review DoD ở `01-spec.md` — tick hết
