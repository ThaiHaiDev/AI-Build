# Sprint 03 — Test Account Vault · Tasks

> **Atomic checklist** • Status: Draft • Updated: 2026-04-20
> Mỗi task ≤ 30–60 phút. Tick `[x]` khi xong. Liên kết commit ở `04-history.md`.
> BE và FE chạy song song. FE sẽ làm **UI Redesign** trước trong lúc đợi API BE hoàn thiện.

---

## 🔧 BE — Test Account API

### Foundation

- [ ] **B10** · Tạo model `TestAccount` (fields: `id`, `projectId`, `env: enum(dev|staging|production)`, `label`, `username`, `password`, `url`, `notes`, `createdById`, `createdAt`, `updatedAt`) + migration
- [ ] **B11** · Tạo `testAccountStore` / service layer: `create`, `update`, `delete` (hard delete), `findByProject(projectId)`, `findById`
- [ ] **B12** · Seed demo: 3 account test cho `Project Alpha` (1 per env) — chỉ seed khi `count() === 0`
- [ ] **B13** · Middleware `requireAccountAccess`: check quyền theo rule — SA toàn quyền; Admin là active member của project → toàn quyền trong project; User là active member → chỉ đọc; ngoài project → 403

### Endpoints (versioned `/api/v1`)

- [ ] **B20** · `GET /projects/:id/accounts` — List account của dự án, group theo env (áp `requireProjectAccess` + `requireAccountAccess`)
- [ ] **B21** · `GET /projects/:id/accounts/:accountId` — Chi tiết 1 account (áp `requireAccountAccess`)
- [ ] **B22** · `POST /projects/:id/accounts` — Tạo account (SA + Admin in project only; validate env, label, username required)
- [ ] **B23** · `PATCH /projects/:id/accounts/:accountId` — Sửa account (SA + Admin in project only; không sửa được `projectId` / `env` nếu không phải SA)
- [ ] **B24** · `DELETE /projects/:id/accounts/:accountId` — Xóa account (SA + Admin in project only)

### Error handling & security

- [ ] **B30** · Tất cả endpoint dùng `asyncHandler` + throw `AppError` subclass
- [ ] **B31** · User không có quyền ghi (role=USER) gọi POST/PATCH/DELETE → 403 `ForbiddenError`
- [ ] **B32** · `accountId` không thuộc `projectId` trong URL → 404 `NotFoundError`
- [ ] **B33** · Rate limit `POST /projects/:id/accounts` (tránh bulk insert abuse)
- [ ] **B34** · Không log `password` field ra pino (thêm vào redaction list nếu chưa có)

### Testing

- [ ] **B40** · Integration test `POST /projects/:id/accounts`: SA success + Admin-in-project success + User-in-project 403 + outsider 403
- [ ] **B41** · Integration test `GET /projects/:id/accounts`: SA thấy all, member thấy all, outsider 403
- [ ] **B42** · Integration test `PATCH` + `DELETE`: Admin-in-project thành công; User-in-project 403
- [ ] **B43** · Integration test không dùng mock DB — hit Postgres thật local `aiTest`

---

## 🎨 FE — Track A: UI Redesign (làm trước, song song BE)

> Đây là nhiệm vụ FE ưu tiên làm **trong lúc đợi API BE**. Không block bởi sprint-03 BE.
> Design source: `docs/ui-designs/design_handoff_auth/` và `docs/ui-designs/design_handoff_home_me/`

### U-TOKEN · Design Tokens (nền tảng chung)

- [ ] **U00** · Đọc `docs/ui-designs/design_handoff_auth/README.md` — nắm token system (OKLCH color, typography Inter Tight, spacing, shadow)
- [ ] **U01** · Cập nhật `src/styles/variables.css`: thay thế token cũ bằng token mới theo design (color, radius, shadow) — không xóa token đang dùng ở sprint-02 cho đến khi migrate hết
- [ ] **U02** · Verify token mới không break layout sprint-02 (projects pages) — visual smoke test

### U-AUTH · Auth UI Redesign

> Reference: `docs/ui-designs/design_handoff_auth/Auth.reference.html` (mở trên browser để xem interactive)

- [ ] **U10** · Cập nhật `AuthLayout`: split design — cột trái form, cột phải dark brand panel; đúng breakpoint (single column mobile)
- [ ] **U11** · Cập nhật `AuthCard`: thêm mode-switch pill (Login / Register tab trong card)
- [ ] **U12** · Cập nhật `LoginForm`: layout, spacing, hover/focus state theo design mới; không thay đổi validation logic (react-hook-form + Zod đã có)
- [ ] **U13** · Cập nhật `RegisterForm`: layout, spacing; thêm password strength indicator (4 level: weak/fair/strong/very strong) theo algorithm trong README
- [ ] **U14** · Language toggle trong AuthCard (đã có `useTranslation`, chỉ update vị trí và style)
- [ ] **U15** · Thêm i18n key còn thiếu theo `docs/ui-designs/design_handoff_auth/README.md` (section i18n keys) vào `src/locales/{vi,en}/auth.json`
- [ ] **U16** · QA auth redesign: test login flow, register flow, error states, responsive mobile/desktop

### U-HOME · App Shell & Home Redesign

> Reference: `docs/ui-designs/design_handoff_home_me/HomeMe.reference.html`

- [ ] **U20** · Cập nhật `AppHeader`: navigation links, search bar placeholder, language toggle, notifications icon, user menu dropdown — layout theo design
- [ ] **U21** · Cập nhật `HomePage`: greeting section, stats grid (4 cards), danh sách projects gần đây + runs gần đây (2 cột) — layout + token
- [ ] **U22** · Thêm i18n key còn thiếu cho `home` namespace theo README (greeting, stats labels, section titles) vào `src/locales/{vi,en}/home.json`; tạo file nếu chưa có
- [ ] **U23** · QA home redesign: kiểm tra responsive, loading state, empty state vẫn đúng

### U-ME · Profile Page Redesign

> Reference: `docs/ui-designs/design_handoff_home_me/HomeMe.reference.html` (tab Me)

- [ ] **U30** · Cập nhật `MePage`: identity strip (avatar placeholder + name + email + role badge), info card với các field cá nhân
- [ ] **U31** · Thêm i18n key còn thiếu cho `me` namespace vào `src/locales/{vi,en}/me.json`; tạo file nếu chưa có
- [ ] **U32** · QA me page: edit flow (nếu editable fields đã có), display-only nếu chưa (sprint-04 sẽ thêm edit user)

---

## 🎨 FE — Track B: Test Account Vault UI (làm sau khi BE có API)

### Foundation

- [ ] **F10** · Thêm i18n namespace `accounts` VN/EN — key cho env labels, form fields, messages, copy confirmation
- [ ] **F11** · Service layer `accountService.ts`: wrap B20–B24, type-safe với `TestAccount` interface
- [ ] **F12** · State management: Zustand store hoặc TanStack Query cho account list per project

### US-07 · Xem account test

- [ ] **F20** · Thêm tab "Tài khoản test" vào `ProjectDetailPage` (cạnh "Tổng quan" và "Thành viên")
- [ ] **F21** · `AccountsTab`: group account theo env, hiển thị 3 section (Dev / Staging / Production)
- [ ] **F22** · `AccountCard`: hiển thị label, username (visible), password (masked `••••••••`), URL (link), notes (optional); tất cả role đều thấy
- [ ] **F23** · Copy-to-clipboard cho username, password, URL — icon button, toast "Đã sao chép" sau khi copy
- [ ] **F24** · Empty state khi chưa có account trong env: "Chưa có tài khoản. Thêm tài khoản mới."

### US-08 · Thêm / Sửa account (SA + Admin in project)

- [ ] **F30** · Nút "+ Thêm tài khoản" chỉ hiện khi SA hoặc Admin in project (dùng `useHasPermission` + membership check)
- [ ] **F31** · `AccountFormModal` với `react-hook-form` + Zod: env (select), label (required), username (required), password (required), url (optional, validate format nếu có), notes (optional, max 500)
- [ ] **F32** · Wire submit → `accountService.create` → close modal → refresh list → toast success
- [ ] **F33** · Nút "Sửa" trên `AccountCard` (chỉ SA + Admin): mở modal pre-fill → `accountService.update` → refresh → toast
- [ ] **F34** · Handle lỗi: network → toast; 403 → toast "Không có quyền"

### US-09 · Xóa account (SA + Admin in project)

- [ ] **F40** · Nút "Xóa" trên `AccountCard` (chỉ SA + Admin)
- [ ] **F41** · Confirm modal: "Xóa tài khoản `<label>`? Hành động này không thể hoàn tác."
- [ ] **F42** · Wire → `accountService.delete` → refresh list → toast

### Permission gating

- [ ] **F50** · User in project: thấy tab + xem + copy; KHÔNG thấy nút thêm/sửa/xóa
- [ ] **F51** · User ngoài project: không thấy tab (hoặc 403 nếu truy cập trực tiếp URL)

### Polish

- [ ] **F55** · Loading state khi fetch accounts; skeleton hoặc spinner
- [ ] **F56** · Responsive: AccountCard stack đẹp trên mobile
- [ ] **F57** · Cleanup: xóa `console.log`, verify i18n không hardcode

---

## 🧪 QA / Test thủ công

- [ ] **Q01** · Auth redesign: đăng nhập / đăng ký với UI mới — validate, error state, responsive
- [ ] **Q02** · Home + Me redesign: đăng nhập vào dashboard, xem stats, vào /me — responsive
- [ ] **Q03** · Với SA: thêm account test 3 env cho Project Alpha → thấy đủ 3 card; copy password hoạt động
- [ ] **Q04** · Với Admin in project: thêm/sửa/xóa account → thành công
- [ ] **Q05** · Với User in project: thấy account, copy được, không thấy nút thêm/sửa/xóa
- [ ] **Q06** · Với User ngoài project: không truy cập được tab account
- [ ] **Q07** · Verify không regress: project list, detail, member management sprint-02 vẫn đúng

---

## Sprint close

- [ ] **C01** · Update `04-history.md` với summary + các commit liên quan
- [ ] **C02** · Review DoD ở `01-spec.md` — tick hết
- [ ] **C03** · Tag git `sprint-03-test-account-vault-done`
- [ ] **C04** · Ghi bugs phát sinh (nếu có) vào `bugs/` của sprint 03
