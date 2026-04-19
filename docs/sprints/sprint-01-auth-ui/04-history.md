# Sprint 01 — Auth UI · History

> Append-only log. Mỗi entry = 1 task done hoặc 1 quyết định nghiệp vụ thay đổi.
> Format: `## YYYY-MM-DD HH:MM · Task ID · Tóm tắt` + body ngắn.

---

## 2026-04-18 · Sprint kickoff

- Spec + Plan + Tasks + Test cases đã viết xong, chưa init FE.
- Backend auth đã sẵn sàng (verified: register/login/me/refresh/logout chạy ngon trên local Postgres `aiTest`).
- Quyết định khoá: 10 decision tại [02-plan.md § Decision nghiệp vụ](./02-plan.md).

---

## 2026-04-19 · T01-T04 · Foundation Auth + Toast + Layout

- **Outcome**: lớp nền sẵn sàng cho 3 page Auth. Types/store/schema/i18n/toast/layout đều hoạt động, typecheck pass.
- **Files**: `features/auth/types/auth.types.ts`, `features/auth/store/authStore.ts`, `features/auth/utils/parseAuthError.ts`, `shared/schemas/auth.schema.ts`, `locales/{vi,en}/auth.json`, `components/ui/Toast/`, `components/layout/AuthLayout/`, `features/auth/components/AuthCard/`.
- **Decision**: build Toast bằng Zustand thay vì thêm dep (sonner, react-hot-toast) — tránh bump bundle khi nhu cầu còn đơn giản. Revisit nếu cần queue/position phức tạp.
- **Follow-up**: none.

---

## 2026-04-19 · T05-T08 · Register flow

- **Outcome**: `/register` hoạt động end-to-end với BE local. Zod validate (email, password strength, confirm match), submit thành công redirect `/me`.
- **Files**: `shared/schemas/auth.schema.ts` (registerSchema + passwordStrength), `features/auth/components/RegisterForm/`, `pages/Register/RegisterPage.tsx`.
- **Test case**: TC Register golden path — pass (verified curl `POST /api/v1/auth/register` 200 + redirect). Duplicate email → toast `errors.EMAIL_EXISTS` (verified 409).
- **Follow-up**: browser UX smoke test do user chạy.

---

## 2026-04-19 · T09-T13 · Login flow

- **Outcome**: `/login` hoạt động, có "Remember", toggle hiện/ẩn password, redirect query `?redirect=<path>` sau login.
- **Files**: `shared/schemas/auth.schema.ts` (loginSchema), `features/auth/components/LoginForm/`, `pages/Login/LoginPage.tsx`.
- **Test case**: Wrong credentials → toast `errors.INVALID_CREDENTIALS` (verified 401). Redirect query → sau login quay về `/me` (verified path preserve).
- **Follow-up**: browser verify deep-link flow.

---

## 2026-04-19 · T14-T16 · /me page

- **Outcome**: `/me` render card profile (avatar initial, email, role badge, joined date) với `formatDate` locale-aware.
- **Files**: `pages/Me/MePage.tsx`, `pages/Me/MePage.module.scss`.
- **Note nghiệp vụ**: BE hiện không trả `name`/`createdAt`/`permissions` → UI chấp nhận optional, hiển thị fallback. Sẽ render đầy đủ sau khi BE fix — xem [bugs/be-auth-contract-gaps.md](./bugs/be-auth-contract-gaps.md).

---

## 2026-04-19 · T17-T18 · Logout

- **Outcome**: button logout trong `/me` gọi `/auth/logout`, clear store, redirect `/login`. Vào lại `/me` khi chưa auth bị redirect với `?redirect=%2Fme`.
- **Files**: `pages/Me/MePage.tsx`, `features/auth/store/authStore.ts` (logout action), `features/auth/components/ProtectedRoute.tsx` (redirect query).

---

## 2026-04-19 · Router + Header wiring

- **Outcome**: split router thành 2 nhánh — `App` layout (home, public pages) và `AuthLayout` (login/register với gradient bg + card chrome). `Header` auth-aware (show `/me` link khi logged in, login/register khi chưa). `AuthRoute` redirect authenticated user về `/me`.
- **Files**: `router/index.tsx`, `router/routes.ts` (thêm `me` + `layout` field), `App.tsx` (mount ToastContainer), `components/layout/Header/`, `features/auth/components/AuthRoute.tsx`, `ProtectedRoute.tsx`.

---

## 2026-04-19 · Bug discovery · BE contract gaps

- **Phát sinh**: FE test E2E bằng curl → phát hiện BE trả user thiếu `name`/`createdAt`/`permissions` ở cả 3 endpoint auth, và `/auth/me` leak `jti`.
- **Action**: viết spec bug tại [bugs/be-auth-contract-gaps.md](./bugs/be-auth-contract-gaps.md). **Chưa fix** — chờ user review.
- **Workaround FE**: các field trên đặt optional trong `AuthUser`. Sẽ revert khi BE fix.
- **Impact Sprint 02**: cần `permissions` đúng trước khi dùng `useHasPermission` cho UI gating.

---

## 2026-04-19 · BE-BUG-01 FIXED · Auth contract gaps

- **Status**: ✅ Fixed (triển khai trong sprint-02 pre-sprint, task B00–B04).
- **Outcome**: 3 endpoint `/auth/register|login|me` trả đúng shape public `{id, email, name, role, permissions, createdAt}`. `/me` không còn leak `jti`. Permissions derive từ `ROLE_PERMISSIONS` (BE authoritative).
- **Files**:
  - `my-agent-backend/src/auth/utils/toPublicUser.ts` (new) — serializer + kiểu `PublicUser`
  - `my-agent-backend/src/auth/services/AuthService.ts` — register/login trả `toPublicUser(rec)`
  - `my-agent-backend/src/auth/controllers/AuthController.ts` — `/me` fetch record qua `userStore.findById` rồi serialize
- **Note**: Column `name` + `created_at` đã có sẵn ở model User (không cần migration). `permissions` derive từ role, không phải column.
- **Test case liên quan**: TC-BE-01 → TC-BE-05 tại [sprint-02/05-test-cases.md](../sprint-02-project-management/05-test-cases.md).
- **Typecheck**: pass (`npm run typecheck`).
- **Follow-up**: user verify bằng curl (3 endpoint) → sau đó FE thực hiện F00–F02 revert workaround + enable `useHasPermission`.
- **Chi tiết sprint-02**: [sprint-02/04-history.md](../sprint-02-project-management/04-history.md).

---

<!--
Template entry (copy khi cần):

## YYYY-MM-DD HH:MM · T?? · <tóm tắt 1 dòng>

- **Commit**: <hash hoặc "WIP">
- **Test case liên quan**: TC-?? (pass/fail)
- **Note nghiệp vụ**: <thay đổi gì so với plan, lý do>
- **Phát sinh**: <bug, edge case mới, decision cần update>
-->
