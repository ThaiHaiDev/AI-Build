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
