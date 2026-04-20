# Handoff: App Shell — Header + Home + Profile (My Agent)

## Overview
Main authenticated shell for **My Agent** (internal AI agent platform): a shared top header, a Home dashboard, and a single-tab Profile page. Target users are company employees already signed in.

## About the Design Files
`HomeMe.reference.html` is a **design reference created in HTML** — an interactive prototype showing intended look and behavior. It is NOT production code to copy directly.

The task is to **recreate this design inside the existing `my-agent-frontend` codebase** (React + Vite + TypeScript + Tailwind + SCSS modules + i18next + zustand + react-router) using the already-established patterns in:

- `src/components/layout/AppHeader/` — new, top header (shared across all authenticated pages)
- `src/components/layout/AppLayout/` — wrapper that renders `<AppHeader/>` + `<Outlet/>`
- `src/pages/Home/HomePage.tsx` — dashboard
- `src/pages/Me/MePage.tsx` + `MePage.module.scss` — profile (already exists; heavy restyle)
- `src/components/ui/LanguageToggle/` — reuse the pill from the Auth handoff
- `src/locales/vi/common.json`, `src/locales/en/common.json` — header strings
- `src/locales/vi/home.json`, `src/locales/en/home.json` — new namespace
- `src/locales/vi/me.json`, `src/locales/en/me.json` — extend existing

## Fidelity
**High-fidelity.** Exact colors, typography, spacing, copy, and interaction states are defined below.

---

## Design Tokens
Same token set as the Auth handoff — keep `src/styles/variables.css` as the single source of truth:

```css
:root {
  --bg:       oklch(0.985 0.003 90);
  --bg-2:     oklch(0.965 0.004 90);
  --fg:       oklch(0.18 0.01 260);
  --fg-2:     oklch(0.42 0.01 260);
  --fg-3:     oklch(0.62 0.008 260);
  --line:     oklch(0.90 0.004 260);
  --line-2:   oklch(0.94 0.003 260);
  --accent:   oklch(0.58 0.14 150);
  --accent-2: oklch(0.96 0.04 150);
  --danger:   oklch(0.58 0.18 25);
  --warn:     oklch(0.72 0.15 75);
}
```

Typography: **Inter Tight** (UI 400/500/600/700) + **JetBrains Mono** (mono 400/500/600).
Card radius 12px, input/button radius 6px, header height 58px, max content width 1280px (Home), 1080px (Profile).

---

## AppHeader (shared)

Sticky top bar with backdrop blur. Rendered once in `AppLayout` above `<Outlet/>`.

**Structure (L→R):**
1. **Logo** — small rounded black square w/ accent green dot inside, beside stacked label: `my-agent` (600, 14px) + `internal` (mono, 10px, uppercase, tracking 0.12em, color `--fg-3`)
2. **Nav** (hidden below `md`) — exactly **two items**: `Home` and `Projects`. No Knowledge, no Runs, no other items. Each item: 16px icon (color `--fg-3`, or `--accent` when active) + label (13px / 500). Active: `bg: --bg-2`, text `--fg`. Inactive: text `--fg-2`, hover bg `--bg-2`.
3. **Command search** (hidden below `sm`) — 36px tall pill, centered, max-width 360px, `bg: --bg-2`, border `--line`. Contains search icon + placeholder text + trailing `⌘K` kbd chip (mono 11px, white bg, border `--line`).
4. **Language pill (VI/EN)** — identical to the Auth version: globe icon + two pill buttons; active = `bg: --fg` / text `--bg` / mono 600 11px.
5. **Notifications bell** — 36×36 icon button. Tiny accent dot top-right when unread. Opens a 320px dropdown with title row (`Notifications` + `N new` badge in accent-2/accent), then list of items `[title, message, relative time]`. Separator lines `--line-2`. Red dot for failed items, accent dot otherwise.
6. **User menu** — avatar chip (28×28 rounded-full, black bg, white mono 12px 600 initials) + name (hidden below `lg`, 13px / 500, max-width 120 truncate) + chevron. Dropdown: 256px, shows `{name, email mono small}` in a header, then menu items `My profile`, `Settings`, divider, `Sign out` (danger red, spinner replaces icon while signing out).

**DO NOT include:**
- A "New agent" / "Tạo agent" button — removed.
- Knowledge / Runs nav items — removed.

**Dropdown behavior:**
- Open on click, close on outside click.
- Only one of {notifications, user menu} open at a time.
- Entry animation: `opacity 0 → 1, translateY(-4px → 0)` over 120ms ease-out.

---

## Home page

Container: `max-w-[1280px] mx-auto px-6 py-10`.

### 1. Greeting block
- Small meta line above title (mono 11px uppercase tracking 0.18em, color `--fg-3`): `● workspace · engineering` — bullet color `--accent`.
- H1 32px / 600 / tracking-tight: `{timeOfDayGreeting}, {firstName}.` (e.g. "Chào buổi sáng, Nhi." / "Good morning, Nhi.")
  - Compute greeting from `new Date().getHours()` — morning / afternoon / evening.
- Subtitle 15px, color `--fg-2`: "Đây là không gian làm việc nội bộ của bạn." / "This is your internal workspace."

### 2. Stats grid
4 equal cards on `md+`, 2-col on mobile. Each card: rounded-xl border, white bg, 20px padding.
- Label: mono 10.5px uppercase tracking 0.16em, `--fg-3`
- Value: 26px / 600 / tracking-tight
- Delta: mono 11px, color `--accent` for positive, `--danger` for negative (prefix `−`)
- Sparkline: inline SVG, accent stroke 1.4px, no fill, ~160×34 viewBox

Stats list (content real to the product):
| Key | Label VI | Label EN |
|---|---|---|
| stat_agents | Agent đang hoạt động | Active agents |
| stat_runs   | Phiên chạy hôm nay   | Runs today |
| stat_docs   | Tài liệu đã index    | Indexed docs |
| stat_tokens | Token sử dụng (24h)  | Tokens (24h) |

Values come from an endpoint `/api/home/stats` (stub it; mock data for now).

### 3. Two-column section (`lg:grid-cols-[1.4fr_1fr] gap-6`)

**Left — "Project của bạn" / "Your projects" card**
- Card head: title (15px / 600) + right-aligned mono 12px link `See all →` (hover → `--fg`)
- List items (divided by `--line-2`):
  - 40×40 colored badge (lg radius) with 2-letter initials (deterministic color per project)
  - Name (14px / 500) + optional `Shared` mono chip if not owner
  - Description (13px, `--fg-2`) truncate
  - Right: `{runs} runs` + `{updated}` (mono 12px, `--fg-3`)
  - Far right: `Open` button, 32px tall, border `--line`, white bg, only visible on row hover (`opacity-0 group-hover:opacity-100`).

**Right — "Phiên chạy gần đây" / "Recent runs" card**
- Card head: title + right-aligned `24h` mono chip
- List rows:
  - 20×20 status dot badge:
    - running → accent-2 bg + spinning accent icon
    - succeeded → accent-2 bg + check
    - failed → 15% danger bg + red X
  - Agent name (13.5px / 500)
  - Meta line: mono 11.5px, `--fg-3`: `by {user} · {relativeTime}`
  - Right: token count mono (or `—` while running)

### Responsive
- Below `md`: nav hides; greeting title drops to ~26px.
- Below `lg`: two-column section stacks.
- Below `sm`: command search hides; stats grid becomes 2 cols.

---

## Profile (Me) page

Container: `max-w-[1080px] mx-auto px-6 py-10`.

**IMPORTANT — only ONE tab ("Personal info"). DO NOT render a tab strip.**
The reference prototype originally had Security + Sessions tabs; those are **removed** per spec. Hide the tabs UI entirely when there's only one tab.

### 1. Page header
- Same meta strip pattern: `● account / profile` (accent bullet)
- H1 28px / 600 / tracking-tight: "Hồ sơ" / "Profile"
- Subtitle 14.5px `--fg-2`: "Quản lý thông tin cá nhân và quyền truy cập." / "Manage your personal info and access."
- Right-side transient "Saved" flash chip (accent-2 bg + accent text + check icon) — appears for ~1.8s after save.

### 2. Identity strip card
- Rounded-xl border, overflow-hidden.
- Top banner 88px tall, `bg: --fg` (near-black), decorated with:
  - Faint 32px white grid (`opacity 0.08`)
  - Offscreen top-right accent blob (`blur-3xl opacity-30`)
- Overlap layout: avatar block sits `-mt-10` from banner:
  - 80×80 rounded-2xl, 4px `--bg` border, mono 22px 700 initials, bg `--bg`, color `--fg`
- Right of avatar:
  - Name (20px / 600)
  - Role pill (mono 11px, accent-2 bg, accent text)
  - Sub-line mono 12.5px: `{email} · {team} · {employeeId}`
- Far right: **Edit** button (border `--line`, pencil icon, 13px / 500). Hidden while `editing === true`.

### 3. Personal info card
Header + 2-column grid (`sm:grid-cols-2 gap-x-8 gap-y-5 p-6`) of rows.

Each row:
- Small uppercase label (12px tracking 0.08em, `--fg-3`)
- Optional badge on the right of label (mono 10.5px, `--bg-2` bg, `--fg-3` text) — used for `email` ("không thể đổi" / "locked")
- Value: 14px. Mono for `employeeId` and `joined`.
- In edit mode (not `readOnly`): `<input>` (h-9, border `--line`, radius 6px, focus ring) OR `<select>` with the listed options.

Row list:
| Field | Editable | Type | Options |
|---|---|---|---|
| name (Họ và tên / Full name) | yes | text | — |
| email (Email công ty / Work email) | **no** | text, with `locked` badge | — |
| employee_id (Mã nhân viên / Employee ID) | no | mono text | — |
| team (Phòng ban / Department) | yes | select | Engineering, Product, Design, Data, Operations |
| manager (Quản lý trực tiếp / Direct manager) | yes | text | — |
| joined (Tham gia / Joined) | no | mono date | VI: `DD/MM/YYYY`, EN: `MMM D, YYYY` |

**Edit actions footer** (visible only while editing, inside same card):
- Top border `--line-2`, bg `--bg-2`, px-6 py-4, right-aligned.
- `Cancel` (text button, `--fg-2`, resets form to original values)
- `Save changes` (primary: `bg --fg`, text `--bg`, hover brightness 1.1)

Save behavior: optimistic — flip `editing=false`, show "Saved" flash for 1.8s. Wire to `PATCH /api/me` (stub).

---

## i18n keys

### `src/locales/vi/common.json` — merge
```json
{
  "header": {
    "brand": "my-agent",
    "brand_sub": "internal",
    "nav_home": "Trang chủ",
    "nav_projects": "Projects",
    "search_placeholder": "Tìm agent, prompt, tài liệu…",
    "search_kbd": "⌘K",
    "notifications": "Thông báo",
    "notif_new": "{{n}} mới",
    "profile": "Hồ sơ của tôi",
    "settings": "Cài đặt",
    "signout": "Đăng xuất",
    "signing_out": "Đang đăng xuất…"
  }
}
```

### `src/locales/vi/home.json`
```json
{
  "greeting": {
    "morning": "Chào buổi sáng",
    "afternoon": "Chào buổi chiều",
    "evening": "Chào buổi tối"
  },
  "workspace_meta": "workspace · engineering",
  "sub": "Đây là không gian làm việc nội bộ của bạn.",
  "stat_agents": "Agent đang hoạt động",
  "stat_runs": "Phiên chạy hôm nay",
  "stat_docs": "Tài liệu đã index",
  "stat_tokens": "Token sử dụng (24h)",
  "your_projects": "Project của bạn",
  "see_all": "Xem tất cả",
  "recent_runs": "Phiên chạy gần đây",
  "shared": "Được chia sẻ với bạn",
  "running": "Đang chạy",
  "by": "bởi",
  "open": "Mở"
}
```

### `src/locales/vi/me.json` — merge/replace
```json
{
  "title": "Hồ sơ",
  "sub": "Quản lý thông tin cá nhân và quyền truy cập.",
  "meta": "account / profile",
  "personal": "Thông tin cá nhân",
  "personal_sub": "Thông tin này hiển thị cho đồng nghiệp trong workspace.",
  "name": "Họ và tên",
  "email": "Email công ty",
  "email_locked": "không thể đổi",
  "employee_id": "Mã nhân viên",
  "team": "Phòng ban",
  "manager": "Quản lý trực tiếp",
  "joined": "Tham gia",
  "edit_btn": "Chỉnh sửa",
  "save": "Lưu thay đổi",
  "cancel": "Huỷ",
  "saved": "Đã lưu"
}
```

English mirrors — provide complete EN versions of all three files.

---

## State & services

- Add `useMeStore` (zustand) or extend `useAuthStore` to hold editable profile fields. Saving calls `meService.updateProfile(partial)`.
- Add `homeService.getStats()` and `homeService.getProjects()` and `homeService.getRecentRuns(limit=4)` — stub with fixtures matching shapes used in the prototype.
- Notifications list can come from `notificationsService.list({limit:5})`.
- Persist language via `i18next-browser-languagedetector` to localStorage (same as Auth).

## Routing
- `/` → HomePage (protected, requires auth)
- `/me` → MePage (protected)
- AppLayout wraps both and renders the shared header.

## Icons
Inline SVGs, 16px default, stroke 1.6, `currentColor`. Reuse the icon set from Auth handoff and extend with: `home, bot, bell, search, plus (unused), chev, dots, spin, check, x, arrow, globe, mon, phone, shield, key, pencil, logout, gear`. All shapes are in `HomeMe.reference.html`'s `I` object — copy verbatim.

## Files to touch

```
src/
├── components/
│   ├── layout/
│   │   ├── AppHeader/
│   │   │   ├── AppHeader.tsx              ← NEW
│   │   │   ├── AppHeader.module.scss      ← NEW
│   │   │   ├── NotifMenu.tsx              ← NEW
│   │   │   └── UserMenu.tsx               ← NEW
│   │   └── AppLayout/
│   │       └── AppLayout.tsx              ← NEW — wraps header + <Outlet/>
│   └── ui/LanguageToggle/                 ← reuse from Auth handoff
├── pages/
│   ├── Home/
│   │   ├── HomePage.tsx                   ← rewrite
│   │   ├── HomePage.module.scss           ← NEW
│   │   ├── StatsGrid.tsx                  ← NEW
│   │   ├── ProjectsCard.tsx               ← NEW
│   │   └── RecentRunsCard.tsx             ← NEW
│   └── Me/
│       ├── MePage.tsx                     ← rewrite (single tab)
│       └── MePage.module.scss             ← rewrite
├── features/
│   ├── home/services/homeService.ts       ← NEW (stats, projects, runs)
│   └── me/services/meService.ts           ← NEW (updateProfile)
├── locales/
│   ├── vi/common.json                     ← merge header keys
│   ├── en/common.json                     ← merge header keys
│   ├── vi/home.json                       ← NEW
│   ├── en/home.json                       ← NEW
│   ├── vi/me.json                         ← merge/replace
│   └── en/me.json                         ← merge/replace
└── styles/variables.css                   ← tokens (already from Auth handoff)
```

## Reference
Open `HomeMe.reference.html` in a browser. Turn on the Tweaks panel in the toolbar to switch between **Home** and **Profile**, and between **VI** and **EN**.
