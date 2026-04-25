# Sprint 03 — Test Account Vault · History

> **Append-only log** — mỗi entry ghi outcome + file liên quan + follow-up. Không sửa entry cũ.

---

## 2026-04-20 · Khởi tạo sprint + bổ sung track UI Redesign

**Outcome**: Tạo `03-tasks.md` sprint 03 với 2 track FE song song:
- **Track A — UI Redesign** (U00–U32): Cập nhật auth, home, me page theo design mới từ `docs/ui-designs/`. FE làm track này trong lúc đợi BE hoàn thành API. Không block bởi sprint-03 BE.
- **Track B — Test Account Vault UI** (F10–F57): Feature chính của sprint, làm sau khi BE có API.

**Lý do bổ sung track UI Redesign vào sprint 03**: Đã có file design handoff từ Claude Design cho auth (login/register) và app shell (home/me). Thay vì để riêng một sprint nhỏ, tận dụng thời gian song song BE-FE để FE hoàn thiện UI foundation trước khi sprint-04 (User Management) cần các trang này.

**Files tạo mới**:
- `docs/sprints/sprint-03-test-account-vault/03-tasks.md`
- `docs/sprints/sprint-03-test-account-vault/04-history.md` (file này)

**Design source**:
- `docs/ui-designs/design_handoff_auth/` — Auth UI (AuthLayout, LoginForm, RegisterForm, password strength, i18n)
- `docs/ui-designs/design_handoff_home_me/` — AppHeader, HomePage, MePage

**Follow-up**:
- Cần tạo `01-spec.md` và `02-plan.md` cho sprint 03 trước khi bắt đầu BE
- Migration `TestAccount` cần review schema với team trước khi implement

---

## 2026-04-24 · FE Track A — UI Redesign hoàn thành (U00–U32)

**Outcome**: Implement toàn bộ UI Redesign theo design handoff. Không cần BE API.

**Các thay đổi chính**:

### Phase 1 — Design Tokens (U00–U02)
- `src/styles/variables.css` — thay thế 2 dòng cũ bằng full OKLCH token set (`--bg`, `--fg`, `--accent`, `--danger`, `--warn`, v.v.) + giữ alias cũ cho sprint-02
- `index.html` — thêm Google Fonts: Inter Tight + JetBrains Mono
- `src/styles/index.css` — cập nhật font-family, font-feature-settings

### Phase 2 — Auth Redesign (U10–U16)
- `src/features/auth/components/icons.tsx` (NEW) — inline SVG icons
- `src/components/ui/LanguageToggle/LanguageToggle.tsx` (NEW) — pill VI/EN cố định góc phải
- `src/components/layout/AuthLayout/AuthLayout.tsx` — split 2-col (form | dark brand panel)
- `src/components/layout/AuthLayout/AuthLayout.module.scss` — brand panel với grid bg + accent blob
- `src/features/auth/components/AuthCard/` — thêm mono label + mode-switch pill (Login/Register tabs)
- `src/features/auth/components/LoginForm/` — inline error banner, leading icons, submit states (idle/submitting/success), custom checkbox
- `src/features/auth/components/RegisterForm/` — team select, name+team side-by-side, password strength meter (4 segments)
- `src/shared/schemas/auth.schema.ts` — xóa domain restriction, thêm `team` field, cập nhật `passwordStrength()`, min password 10 ký tự
- `src/locales/vi/auth.json`, `src/locales/en/auth.json` — full key set per handoff

### Phase 3 — App Shell & Home (U20–U23)
- `src/components/layout/AppHeader/` (NEW) — sticky header: logo, nav (Home/Projects), search pill, LanguageToggle, NotifMenu, UserMenu
- `src/components/layout/AppLayout/AppLayout.tsx` (NEW) — wrapper cho protected routes
- `src/router/index.tsx` — cập nhật routing: protected routes dùng AppLayout
- `src/pages/Home/HomePage.tsx` — rewrite: greeting block + stats grid + 2-col (ProjectsCard + RecentRunsCard)
- `src/pages/Home/StatsGrid.tsx`, `ProjectsCard.tsx`, `RecentRunsCard.tsx` (NEW)
- `src/features/home/services/homeService.ts` (NEW) — stub fixtures
- `src/locales/vi/home.json`, `src/locales/en/home.json` (NEW)
- `src/locales/vi/common.json`, `src/locales/en/common.json` — merge header keys

### Phase 4 — Profile Page (U30–U32)
- `src/pages/Me/MePage.tsx` — rewrite: identity strip (banner + avatar overlap), personal info card với edit mode, "Saved" flash
- `src/pages/Me/MePage.module.scss` — rewrite
- `src/features/me/services/meService.ts` (NEW) — stub `updateProfile`
- `src/locales/vi/me.json`, `src/locales/en/me.json` (NEW)
- `src/lib/i18n.ts` — đăng ký thêm `home`, `me` namespaces

**Files thay đổi**: 30+ files (new + modified)

**Follow-up**:
- Cần test thực tế trên browser (Node version trên máy quá cũ để chạy Vite build check)
- Track B (Test Account Vault UI) chờ BE API hoàn thành
- Sprint-04 sẽ dùng MePage edit flow cho User Management
