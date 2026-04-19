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
