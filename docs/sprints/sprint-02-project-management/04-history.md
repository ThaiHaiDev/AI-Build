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
