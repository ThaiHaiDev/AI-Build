# Handoff: Auth (Login + Register) Redesign — My Agent

## Overview
Redesign of the internal Login and Register screens for **My Agent** (internal AI agent platform). Target users are company employees signing in with their work email. No external SSO in this iteration — email + password only, with a VI/EN language toggle.

## About the Design Files
The `Auth.reference.html` file in this bundle is a **design reference created in HTML** — a prototype showing intended look and behavior. It is NOT production code to copy directly.

The task is to **recreate this design inside the existing `my-agent-frontend` codebase** (React + Vite + TypeScript + Tailwind + SCSS modules + i18next + react-hook-form + zod) using the already-established patterns in:

- `src/features/auth/components/AuthCard/` — card shell
- `src/features/auth/components/LoginForm/` — login form
- `src/features/auth/components/RegisterForm/` — register form
- `src/pages/Login/LoginPage.tsx` and `src/pages/Register/RegisterPage.tsx` — page wrappers
- `src/components/layout/AuthLayout/` — outer layout (this is where the brand panel lives)
- `src/locales/vi/auth.json` and `src/locales/en/auth.json` — i18n strings

Apply the visual direction from the reference inside those files. Don't ship the HTML.

## Fidelity
**High-fidelity.** Exact colors, typography, spacing, copy, and interaction states are defined below. Match pixel-for-pixel where feasible; where the existing `Input` / `Button` / `FormField` components differ slightly, prefer consistency with the codebase's component API over literal reproduction.

---

## Design Tokens

Add these to `src/styles/variables.css` (keep existing `--color-bg` / `--color-fg` if referenced elsewhere):

```css
:root {
  /* neutrals (warm) */
  --bg:       oklch(0.985 0.003 90);
  --bg-2:     oklch(0.965 0.004 90);
  --fg:       oklch(0.18 0.01 260);
  --fg-2:     oklch(0.42 0.01 260);
  --fg-3:     oklch(0.62 0.008 260);
  --line:     oklch(0.90 0.004 260);
  --line-2:   oklch(0.94 0.003 260);

  /* accent (terminal green) */
  --accent:   oklch(0.58 0.14 150);
  --accent-2: oklch(0.96 0.04 150);

  /* semantic */
  --danger:   oklch(0.58 0.18 25);
  --warn:     oklch(0.72 0.15 75);
}
```

### Typography
- **UI font:** `Inter Tight`, weights 400/500/600/700 — load via Google Fonts
- **Mono font:** `JetBrains Mono`, weights 400/500/600 — for labels, version strings, kbd, code-like UI
- **Base size:** 14px for form inputs, 13px for labels, 12–11px for meta/mono
- **Headings:** Title 30–34px / 600 / tracking-tight / line-height 1.1
- Enable `font-feature-settings: "ss01","cv11"` for Inter Tight

### Spacing & radii
- Card radius: 12px (outer card), 6px (inputs/buttons)
- Form row gap: 12px
- Input vertical padding: 10px (py-2.5); horizontal 12px
- Primary button padding: 12px vertical (py-3)
- Grid gap in brand panel background: 40px

### Shadows
- Card: `0 1px 0 rgba(0,0,0,0.03), 0 20px 40px -24px rgba(0,0,0,0.12)`
- Focus ring: `0 0 0 3px color-mix(in oklch, var(--accent) 30%, transparent)`

---

## Layout: AuthLayout (split)

`AuthLayout` renders **two columns** on `lg+`, single column below.

```
┌──────────────────────────┬────────────────────┐
│  1.05fr (form)            │  1fr (brand)        │
│                           │                     │
│  header: logo | tab hint  │  dark bg            │
│                           │  tagline + brand    │
│  form card                │                     │
│                           │                     │
│  footer: legal | links    │  © footer           │
└──────────────────────────┴────────────────────┘
```

- **Left column:** `px-6 sm:px-10 lg:px-16 py-8`, form centered vertically, max form width **440px**.
- **Right column:** `hidden lg:flex`, `background: var(--fg)` (near-black), text `var(--bg)`. Contains:
  - Faint 40px white grid background (opacity 0.07)
  - Radial accent blob (accent color, blur-3xl, opacity 0.3, top-right offscreen)
  - Small top-left label with green dot: `my-agent · internal` (mono, 11px, uppercase, tracking-[0.18em])
  - Centered headline (40px / 600 / leading-1.08): "Không gian nội bộ cho **AI agents**." (the "AI agents" span uses `var(--accent)`)
  - Sub-tagline (15px, white @ 70% alpha)
  - Footer line: `© 2026 · Internal use only` (mono, 11px, white @ 45%)

The language toggle sits **fixed top-right** of the viewport (see Language Toggle section below) so it overlays the dark brand panel.

---

## Component: AuthCard (reuse existing)

The existing `AuthCard` shows title + subtitle + body. Keep its API but restyle:

- Above title: small mono label with green bullet — e.g. `● auth / signin` (uppercase, tracking-[0.18em], `var(--fg-3)` with dot `var(--accent)`)
- Title: 30–34px, 600, tracking-tight, color `var(--fg)`
- Subtitle: 15px, color `var(--fg-2)`, margin-top 8px

**Mode switch pill** (above SSO was removed — now placed directly above form):
- Inline-flex, p-0.5, rounded-lg, border `var(--line)`, bg `var(--bg-2)`
- Two buttons, active = white bg + shadow-sm, color `var(--fg)`; inactive opacity 0.6
- Inner padding: `px-3.5 py-1.5`, radius 6px, 13px / 500

---

## Component: LoginForm

Fields (reuse `FormField` + `Input`):

| Field | Type | Required | Rules | Placeholder |
|---|---|---|---|---|
| email | email | yes | valid email format | `ten.ban@company.vn` |
| password | password | yes | non-empty | `Nhập mật khẩu` |
| remember | checkbox | — | default true | "Giữ đăng nhập 30 ngày trên thiết bị này" |

**NOTE:** No domain restriction. Any valid email format is accepted. Update `loginSchema` in `src/shared/schemas/auth.schema.ts` accordingly — remove any `@company.vn` enforcement.

### Input styling
- Wrapper: `flex items-center gap-2 rounded-md border bg-white`, border `var(--line)`
- Focus-within: border `var(--accent)` + focus ring (see tokens)
- Invalid: border `var(--danger)`
- Leading icon slot (16px, color `var(--fg-3)`) — mail/lock/user icons (inline SVG, 1.6 stroke)
- Trailing slot — eye toggle for password (aria-label swaps)
- Input: `py-2.5 px-3`, 14px, placeholder `var(--fg-3)`

### Label row
- Row flex with `label` on left, `hint` on right (e.g. the "Forgot password?" link on the password field)
- Label: 13px / 500, color `var(--fg)`
- Hint: 12px, color `var(--fg-3)`, hover → `var(--fg)`

### Error message
- Slot under each input, `min-height: 18px` to prevent jitter
- 12px, color `var(--danger)`

### Checkbox
- Custom 16×16 square, radius 2px
- Unchecked: white bg, border `var(--line)`
- Checked: bg + border `var(--accent)`, white tick icon (svg path, 1.8 stroke)
- Label: 13px, color `var(--fg-2)`

### Submit button
- Full width, `py-3`, radius 6px, 14px / 600
- bg `var(--fg)`, text `var(--bg)`
- Hover: `brightness(1.1)`; active: `scale(.995)`
- Trailing arrow icon that translates `+2px x` on hover
- **States:**
  - `idle`: label + arrow icon
  - `submitting`: spinner + "Đang xác thực…", `cursor-wait`, opacity 0.7
  - `success`: animated check tick (dash 24, 0.45s ease-out) + "Đăng nhập thành công. Đang chuyển hướng…"
  - `error`: stays in idle visually; show top-of-form error banner instead

### Top-of-form error banner
- Shown when credentials fail
- `border`, `px-3 py-2.5`, rounded-md
- border `color-mix(in oklch, var(--danger) 30%, var(--line))`
- bg `color-mix(in oklch, var(--danger) 7%, transparent)`
- Icon (16px circle-exclaim) + 13px message, color `var(--danger)`

### Footer hint (below button)
- 12px centered, color `var(--fg-3)`
- Login: "Sử dụng email công ty đã được cấp bởi bộ phận IT."
- Register: "Bằng việc tiếp tục, bạn đồng ý với Chính sách sử dụng nội bộ"

### Bottom link (swap mode)
- Already present in codebase — restyle to dotted underline, offset-4, hover → `var(--fg)`

---

## Component: RegisterForm

Fields (reuse `FormField` + `Input`):

| Field | Type | Required | Rules |
|---|---|---|---|
| name | text | yes | non-empty |
| team | select | — | Engineering / Product / Design / Data / Operations |
| email | email | yes | valid email format (NO @company.vn restriction) |
| password | password | yes | min 10 chars |
| passwordConfirm | password | yes | must match password |

Layout: `name` and `team` sit side-by-side in a `grid-cols-2 gap-3` row. Email, password, confirm stack below full-width.

### Team select
- Same visual wrapper as Input (border, leading icon = "team" svg)
- Native `<select>` — keep accessible
- Default "Engineering"

### Password strength meter
- 4 equal-width segments (`flex gap-1`, each `h-1 rounded-full`)
- Fills by score (see algorithm below)
- Trailing mono label, color matches strength:
  - Weak (≤1): `var(--danger)` — "Yếu" / "Weak"
  - Medium (≤3): `var(--warn)` — "Trung bình" / "Medium"
  - Strong (=4): `var(--accent)` — "Mạnh" / "Strong"

**Strength algorithm (put in `src/shared/schemas/auth.schema.ts`):**
```ts
export function passwordStrength(p: string): 'weak'|'medium'|'strong' {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (s <= 1) return 'weak';
  if (s <= 3) return 'medium';
  return 'strong';
}
```

---

## Language Toggle

A **fixed** pill in the top-right of the viewport (`top-4 right-4 z-40`), visible on every auth page.

- Inline-flex container with `p-0.5`, rounded-full, border `var(--line)`, bg `white/80` with `backdrop-blur`
- Leading globe icon (14px, color `var(--fg-3)`, 1.6 stroke)
- Two buttons: `VI` and `EN`
  - Active: bg `var(--fg)`, text `var(--bg)`, 11px mono 600, rounded-full, `px-2.5 py-1`
  - Inactive: transparent bg, text `var(--fg-2)`, opacity 0.6 → 1 on hover

### Wire into i18next
The codebase already uses i18next. Call `i18n.changeLanguage('vi' | 'en')` on click and persist via `i18next-browser-languagedetector` (localStorage). Both `auth.json` locales must have a complete key set — see Content/Copy section.

---

## Content / Copy (i18n keys)

Merge into `src/locales/vi/auth.json` and `src/locales/en/auth.json`. Remove outdated keys (`sso`, `err_domain`).

### vi/auth.json (new/updated keys)
```json
{
  "login": {
    "title": "Đăng nhập vào tài khoản",
    "subtitle": "Đăng nhập bằng email công ty của bạn",
    "email": "Email công ty",
    "email_ph": "ten.ban@company.vn",
    "password": "Mật khẩu",
    "password_ph": "Nhập mật khẩu",
    "remember": "Giữ đăng nhập 30 ngày trên thiết bị này",
    "forgot": "Quên mật khẩu?",
    "submit": "Đăng nhập",
    "submitting": "Đang xác thực…",
    "hint": "Sử dụng email công ty đã được cấp bởi bộ phận IT.",
    "success": "Đăng nhập thành công. Đang chuyển hướng…",
    "no_account": "Chưa có tài khoản?",
    "to_register": "Đăng ký ngay"
  },
  "register": {
    "title": "Tạo tài khoản mới",
    "subtitle": "Sử dụng email công ty để tạo tài khoản nội bộ",
    "name": "Họ và tên",
    "name_ph": "Nguyễn Văn A",
    "team": "Phòng ban",
    "email": "Email công ty",
    "email_ph": "ten.ban@company.vn",
    "password": "Mật khẩu",
    "password_new_ph": "Ít nhất 10 ký tự, có số & ký tự đặc biệt",
    "password_confirm": "Nhập lại mật khẩu",
    "tos": "Bằng việc tiếp tục, bạn đồng ý với Chính sách sử dụng nội bộ",
    "submit": "Tạo tài khoản",
    "submitting": "Đang tạo tài khoản…",
    "success": "Tài khoản đã được tạo. Đang chuyển hướng…",
    "strength": { "weak": "Yếu", "medium": "Trung bình", "strong": "Mạnh" },
    "has_account": "Đã có tài khoản?",
    "to_login": "Đăng nhập"
  },
  "brand": {
    "tagline": "Không gian nội bộ cho AI agents.",
    "sub": "Đăng nhập bằng email công ty để quản lý agent, prompt và tri thức chung của đội ngũ."
  },
  "errors": {
    "required": "Bắt buộc",
    "email": "Email không hợp lệ",
    "pwd_short": "Mật khẩu tối thiểu 10 ký tự",
    "pwd_match": "Mật khẩu nhập lại không khớp",
    "credentials": "Email hoặc mật khẩu không đúng"
  }
}
```

### en/auth.json
Same structure. English tagline: **"The internal workspace for AI agents."** — highlight "AI agents" span with accent color.

---

## State Management

No new stores needed. Reuse existing `useAuthStore`, `authService`, `useZodForm`.

**Local state per form:**
- `showPassword: boolean` — eye toggle
- Form state via `react-hook-form` (already wired) + zod resolver
- `isSubmitting` / `isSubmitSuccessful` — drive button state
- Top-of-form error: use React state set inside the `catch` block (already present via `parseAuthError` → toast; **move to inline banner** as specified)

**Schemas** (`src/shared/schemas/auth.schema.ts`) — remove any @company.vn domain rule from both login and register:
```ts
export const loginSchema = z.object({
  email: z.string().min(1, 'errors.required').email('errors.email'),
  password: z.string().min(1, 'errors.required'),
  remember: z.boolean().default(true),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'errors.required'),
  team: z.enum(['Engineering','Product','Design','Data','Operations']).default('Engineering'),
  email: z.string().min(1, 'errors.required').email('errors.email'),
  password: z.string().min(10, 'errors.pwd_short'),
  passwordConfirm: z.string(),
}).refine(v => v.password === v.passwordConfirm, {
  path: ['passwordConfirm'],
  message: 'errors.pwd_match',
});
```

---

## Interactions

- **Mode switch:** tab pill toggles between `/login` and `/register` via `react-router` (do not unmount — navigate). On switch, reset form state and clear errors.
- **Show/hide password:** toggle input `type`. Eye icon swaps between open/closed-eye SVGs. aria-label updates.
- **Password strength:** recompute on every keystroke (throttle not needed at this length).
- **Submit animation:**
  1. Click → button shows spinner + "Đang xác thực…"
  2. On 200 → animate check tick (`stroke-dasharray: 24`, `animation: drawTick 0.45s ease-out forwards`), replace label with success message, then `navigate(redirect ?? '/me', { replace: true })` after ~600ms
  3. On error → revert button to idle, show top-of-form banner with `parseAuthError(err)` message
- **Focus states:** every focusable element gets the accent focus ring (see tokens).
- **Language switch:** instant — i18next re-renders; persist to localStorage.
- **Responsive:** right brand panel disappears at `<lg`. Form column stays centered with full width and `max-w-[440px]`.

---

## Icons
Inline SVGs, 16px, stroke 1.6, `currentColor`. Add to a local `icons.tsx` inside `features/auth/components/`:
- `mail`, `lock`, `user`, `team`, `eye`, `eyeOff`, `arrow-right`, `shield`, `globe`, `check-circle-error`

All paths are present in `Auth.reference.html`'s `I` object — copy from there.

---

## Files to touch

```
src/
├── features/auth/
│   ├── components/
│   │   ├── AuthCard/AuthCard.tsx             ← restyle (mode pill, labels, tokens)
│   │   ├── AuthCard/AuthCard.module.scss     ← update per tokens
│   │   ├── LoginForm/LoginForm.tsx           ← replace SSO block → inline banner, remove domain rule
│   │   ├── LoginForm/LoginForm.module.scss
│   │   ├── RegisterForm/RegisterForm.tsx     ← add team select, strength meter, layout
│   │   ├── RegisterForm/RegisterForm.module.scss
│   │   └── icons.tsx                         ← NEW shared icon set
├── components/
│   ├── layout/AuthLayout/AuthLayout.tsx      ← split columns, dark brand panel
│   ├── layout/AuthLayout/AuthLayout.module.scss
│   └── ui/LanguageToggle/LanguageToggle.tsx  ← NEW, mount inside AuthLayout
├── shared/schemas/auth.schema.ts             ← update schemas, export passwordStrength
├── locales/vi/auth.json                      ← merge keys above
├── locales/en/auth.json                      ← merge keys above
└── styles/variables.css                      ← add design tokens
```

---

## Assets

No image assets. All iconography is inline SVG. The accent blob in the brand panel is a CSS radial blur — no image needed.

## Reference

See `Auth.reference.html` in this folder for the live, interactive prototype. Open it in a browser to see:
- Split layout with dark brand panel (right side)
- Login form (primary deliverable)
- Register form (swap via tab pill)
- VI/EN language toggle (top-right)
- All interaction states

Test `fail@company.vn` as the email on login to see the error-banner state.
