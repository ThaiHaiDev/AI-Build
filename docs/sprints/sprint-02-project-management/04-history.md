# Sprint 02 — Project Management · History

> Append-only log. Mỗi entry = 1 task done hoặc 1 quyết định nghiệp vụ thay đổi.
> Format: `## YYYY-MM-DD HH:MM · Task ID · Tóm tắt` + body ngắn.

---

## 2026-04-19 · Sprint kickoff

- **Context**: Sprint-01 đã close với auth login/register/me/logout chạy end-to-end. Tồn đọng: bug BE contract thiếu `name`/`createdAt`/`permissions` + leak `jti` ở `/me` ([bugs/be-auth-contract-gaps.md](../sprint-01-auth-ui/bugs/be-auth-contract-gaps.md)).
- **Docs**: Spec + Plan + Tasks + Test cases đã viết xong theo chuẩn SDD (spec/plan business-only, tech detail ở tasks).
- **Scope**: Super Admin E2E — CRUD dự án + gán/gỡ member. Account test dành sprint-03. User Management dành sprint-04.
- **Phụ thuộc**: Phải fix BE-BUG-01 trước khi FE enable `useHasPermission` cho gating. Pre-sprint tasks B00–B06 + F00–F02 là bắt buộc.
- **Quyết định khoá**: 12 decision tại [02-plan.md § Decision nghiệp vụ](./02-plan.md).
- **Reference product docs**: [product/01-personas-and-roles.md](../../product/01-personas-and-roles.md) — permission matrix làm source of truth.

---

## 2026-04-19 · B00–B04 · BE Auth contract fix (pre-sprint)

- **Outcome**: Fix tồn đọng bug [be-auth-contract-gaps.md](../sprint-01-auth-ui/bugs/be-auth-contract-gaps.md) từ sprint-01. 3 endpoint auth trả đúng public user shape; `/me` không còn `jti`.
- **Tasks done**: B00 (serializer), B01 (permissions từ ROLE_PERMISSIONS), B02 (register), B03 (login), B04 (me + bỏ jti).
- **Files**:
  - `my-agent-backend/src/auth/utils/toPublicUser.ts` (new)
  - `my-agent-backend/src/auth/services/AuthService.ts`
  - `my-agent-backend/src/auth/controllers/AuthController.ts`
- **Không phát sinh migration**: column `name` + `created_at` đã có sẵn ở model User. `permissions` derive từ role.
- **Typecheck**: pass.
- **Chưa làm**:
  - B05 (integration test): repo chưa có test framework. Cần user quyết định vitest setup hay tạm verify bằng curl (TC-BE-01 → TC-BE-05).
  - B06 (API docs): repo chưa có OpenAPI spec → skip.
  - F00–F02 (FE revert workaround): chờ sau khi user verify BE fix.
- **Follow-up**: verify curl 3 endpoint → đóng B05 → tiếp tục FE pre-sprint.

---

## 2026-04-19 · DB schema design · Full product

- **Outcome**: Thiết kế full DB schema cho toàn sản phẩm (Sprint 01 → 05) để tránh migration phá schema về sau.
- **File**: [my-agent-backend/docs/database-schema.md](../../../my-agent-backend/docs/database-schema.md) (new)
- **Scope**: 5 bảng — `system_user` (có, thêm `is_active`), `projects`, `project_members`, `test_accounts` (Sprint-03), `audit_logs` (Sprint-05).
- **Decision nghiệp vụ phát sinh**:
  - Gộp migration `add_is_active_to_system_user` vào Sprint-02 (thay vì chờ Sprint-04) → 1 lần migration cho cả 2 nhu cầu.
  - `project_members` dùng soft remove với partial unique index `(project_id, user_id) WHERE removed_at IS NULL` để cho phép re-add sau gỡ, giữ history đầy đủ (D3).
  - `tech_stack` để kiểu `TEXT` phase 1, chuyển `TEXT[]` + GIN khi Sprint-05 cần filter.
- **Note**: Tech doc — đặt ở `my-agent-backend/docs/` để không vi phạm rule SDD (spec/plan product chỉ chứa business).
- **Follow-up**: B10–B11 sẽ implement migration + model theo schema này.

---

## 2026-04-19 · B10–B13 · Models + stores Project/ProjectMember

- **Outcome**: Tạo model `Project`, `ProjectMember` + stores CRUD / membership. Thêm `is_active` vào `User` (gộp sớm theo schema doc).
- **Files**:
  - `my-agent-backend/src/database/models/Project.ts` (new)
  - `my-agent-backend/src/database/models/ProjectMember.ts` (new, setup associations)
  - `my-agent-backend/src/database/models/User.ts` (+ isActive)
  - `my-agent-backend/src/projects/stores/projectStore.ts` (new) — case-insensitive name check via `LOWER()`
  - `my-agent-backend/src/projects/stores/projectMemberStore.ts` (new) — soft remove pattern
- **Schema sync**: dựa vào `sequelize.sync({ alter: true })` ở dev, không thêm migration framework.
- **Typecheck**: pass.

---

## 2026-04-19 · B14, B20–B33 · Controllers + routes + middleware

- **Outcome**: 10 endpoint Project/Member/User-search ship đầy đủ với auth + role + membership check + rate limit.
- **Files**:
  - `my-agent-backend/src/projects/middlewares/requireProjectAccess.ts` (new)
  - `my-agent-backend/src/projects/middlewares/projectRateLimiter.ts` (new, in-memory 20req/min/user)
  - `my-agent-backend/src/projects/schemas/project.schema.ts` (new, Zod)
  - `my-agent-backend/src/projects/controllers/ProjectController.ts` (new, 9 handler)
  - `my-agent-backend/src/projects/controllers/UserController.ts` (new, search)
  - `my-agent-backend/src/projects/routes.ts` (new) + mount trong `src/app.ts`
- **Error handling**: throw `AppError` subclass (`ConflictError project.name.duplicate`, `project.archived.readonly`, `ForbiddenError`, `NotFoundError`).
- **Permission**: SA-only cho write; `requireProjectAccess` cho read detail/members.
- **Typecheck**: pass.

---

## 2026-04-19 · B12 · Seed demo projects + users

- **Outcome**: Seed idempotent 4 user (admin SA, leader ADMIN, user USER, outsider USER) + 3 project (Alpha active với leader+user, Beta active, Gamma archived).
- **Files**:
  - `my-agent-backend/src/auth/stores/userStore.ts` (upgrade admin→SUPER_ADMIN, thêm leader/outsider)
  - `my-agent-backend/src/projects/stores/seedDemoProjects.ts` (new)
  - `my-agent-backend/src/index.ts` (gọi seed sau boot)
- **Purpose**: chạy full test cases ở [05-test-cases.md](./05-test-cases.md) không cần setup tay.

---

## 2026-04-19 · API docs cho FE — projects.md

- **Outcome**: Viết FE-facing API docs để triển khai F10–F98 song song mà không cần quay lại hỏi BE.
- **File**: [my-agent-backend/docs/api/projects.md](../../../my-agent-backend/docs/api/projects.md) (new)
- **Scope**: 10 endpoint (method/path/role/body/response/errors/curl) + error envelope + TypeScript types block (`Project`/`ProjectMember`/`UserSummary`/`Role`/`ProjectStatus`) + seed data table + permission matrix cho UI gating (defense in depth).
- **Decision**: chưa có pagination (sprint-05). Search user debounce 300ms recommended ở FE.

---

## 2026-04-19 · FE F00–F98 · Project Management UI + pre-sprint revert

- **Outcome**: Ship toàn bộ FE sprint-02 — list / detail / create / edit / archive / members / search user, verify permission gating, i18n VN+EN.
- **Files (new)**:
  - `my-agent-frontend/src/features/projects/types/project.types.ts`
  - `my-agent-frontend/src/features/projects/services/projectService.ts`
  - `my-agent-frontend/src/features/projects/schemas/project.schema.ts`
  - `my-agent-frontend/src/features/projects/utils/parseProjectError.ts`
  - `my-agent-frontend/src/features/projects/components/{ProjectCard,ProjectForm,ProjectFormModal,AddMemberModal,ConfirmDialog}.tsx`
  - `my-agent-frontend/src/pages/{Projects,ProjectDetail}/*`
  - `my-agent-frontend/src/locales/{vi,en}/projects.json`
- **Files (updated)**:
  - `src/features/auth/types/auth.types.ts` — name/createdAt/permissions nay required (F00)
  - `src/router/routes.ts` — thêm `/projects`, `/projects/:id`
  - `src/services/rest/endpoints.ts` — thêm PROJECTS + USERS.SEARCH
  - `src/lib/i18n.ts`, `src/locales/{vi,en}/index.ts`, `common.json` — namespace + nav label
  - `src/components/layout/Header/Header.tsx` — link "Dự án"
- **Gating**: nút Create/Edit/Archive/Add-Member/Remove-Member hiển thị theo `role === SUPER_ADMIN` + disable nếu archived. BE vẫn chặn độc lập (defense in depth).
- **Typecheck**: FE `tsc --noEmit` pass.

---

## 2026-04-19 · BE bug fix phát sinh · projectStore.findByNameCI

- **Outcome**: Fix 500 khi create/update project do spread `Sequelize.where()` (trả về Literal object không spread được). Đổi sang `{ [Op.and]: [...] }`.
- **File**: `my-agent-backend/src/projects/stores/projectStore.ts`
- **Phát hiện qua**: curl TC-CR-01 / TC-CR-02.

---

## 2026-04-19 · BE seed upgrade · role patch cho user đã tồn tại

- **Outcome**: `seedDemoUsers` không còn phụ thuộc `count === 0`; nếu user demo tồn tại với role lệch (ví dụ admin@ role=admin cũ) → upgrade lên đúng role (admin → super_admin) + thêm các user demo còn thiếu.
- **File**: `my-agent-backend/src/auth/stores/userStore.ts`
- **Lý do**: DB đã có user từ sprint-01 nên seed mới không chạy, gây 403 toàn bộ endpoint SA-only.

---

## 2026-04-19 · Manual E2E verify (TC-LS / TC-CR / TC-ED / TC-AR / TC-MB / TC-VA / TC-FA)

- **Outcome**: Toàn bộ 20+ test case BE pass qua curl với 4 account seed.
- **Pass**:
  - TC-LS-01 SA thấy Alpha+Beta · TC-LS-02 leader chỉ thấy Alpha · TC-LS-03 outsider rỗng · TC-LS-04 `?includeArchived=true` hiện Gamma
  - TC-CR-01 create 201 · TC-CR-02 trùng tên case-insensitive 409 · TC-CR-03 leader 403 · TC-CR-04 name rỗng 400
  - TC-ED-01 patch 200 · TC-AR-01 archive 200 · TC-AR-02 patch archived 409 · TC-AR-03 unarchive 200
  - TC-FA-01 outsider detail Alpha 403 · TC-FA-02 member user thấy Alpha 200
  - TC-MB-01 list members · TC-MB-02 search user · TC-MB-03 add 201 · TC-MB-04 outsider thấy Alpha · TC-MB-05 duplicate 409 · TC-MB-06 remove 200 · TC-MB-07 sau remove 403 · TC-MB-08 non-UUID 400
  - TC-VA-01 partnerEmail sai format 400
- **Note FE UI**: không thể drive browser từ CLI; verify bằng typecheck + tuân thủ contract BE. User cần test trực quan theo TC-UI ở `05-test-cases.md`.

---

## 2026-04-19 · B40–B44 hoãn · Tests

- **Lý do**: repo chưa có test framework (vitest/jest). Chưa tự cài dep lớn khi user chưa duyệt.
- **Tạm thay**: verify thủ công bằng TC-LS/TC-CR/TC-ED/TC-AR/TC-MB ở [05-test-cases.md](./05-test-cases.md) với 4 account seed.
- **Follow-up**: xin user quyết định vitest setup — nếu OK, mở task mới (không thuộc sprint-02 chính).

---

<!--
Template entry (copy khi cần):

## YYYY-MM-DD HH:MM · <Task ID> · <tóm tắt 1 dòng>

- **Outcome**: <kết quả đạt được, 1-2 câu>
- **Commit**: <hash hoặc "WIP">
- **Files**: <file path chính đã thay đổi>
- **Test case liên quan**: TC-?? (pass/fail)
- **Note nghiệp vụ**: <thay đổi gì so với plan, lý do>
- **Phát sinh**: <bug, edge case mới, decision cần update>
- **Follow-up**: <nếu có>
-->
