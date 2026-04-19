# Product Vision — Hệ thống quản lý dự án & tài khoản test nội bộ

> **WHAT/WHY** • Status: Draft • Owner: @haidz1004 • Created: 2026-04-19

## Problem statement

Trong công ty, khi một nhân viên mới join hoặc một dev được assign sang dự án mới, họ **phải tự đi hỏi QC/Tester, Leader, hoặc đồng nghiệp cũ** để xin:

- Account test của môi trường dev/staging/production
- Thông tin cơ bản về dự án (stack công nghệ, đối tác, URL các môi trường)

Hệ quả:

- Mất thời gian cho cả người hỏi và người trả lời (thường lặp lại với mỗi nhân viên mới)
- Account test nằm rải rác ở chat riêng, Excel, Notion cá nhân — không có nguồn truth
- Không kiểm soát được ai đã/đang có quyền xem account của dự án nào
- Khi nhân viên rời dự án/công ty, không ai rà soát lại việc họ đã biết những account nào

## Value proposition

Một **nơi duy nhất** để:

- Lưu thông tin dự án công ty đang quản lý
- Lưu account test theo 3 môi trường (dev / staging / production) của từng dự án
- Phân quyền truy cập theo vai trò: chỉ người thuộc dự án mới thấy được account của dự án đó
- Onboard nhân viên mới bằng 1 thao tác: Super Admin assign user vào các dự án → user login là thấy ngay

## Target users

- **PM / Leader dự án** (Super Admin): người quản lý danh mục dự án và phân bổ nhân sự
- **Dev Lead / Technical Lead** (Admin): người phụ trách kỹ thuật trong 1 hoặc nhiều dự án cụ thể
- **Nhân viên / Developer / QC mới** (User): người cần tra cứu thông tin dự án và account test để làm việc

## Non-goals

Để tránh scope creep, hệ thống này **KHÔNG** phải:

- Password manager tổng của công ty (kiểu 1Password, Bitwarden) — chỉ lưu account test của dự án
- Project management tool (không thay Jira, Trello, Asana — không quản lý task, sprint, backlog)
- CI/CD / DevOps tool (không quản lý deployment, env vars production thật)
- HR / User directory tool (không quản lý lương, ngày nghỉ, org chart)

## Success metrics (định tính, MVP)

- Nhân viên mới onboard 1 dự án mà **không cần hỏi ai** account test
- Super Admin có thể thêm 1 dự án mới + đầy đủ account test trong **< 5 phút**
- Khi user rời dự án, Super Admin gỡ member → user **mất quyền xem ngay lập tức**

## Principles / Guard rails

1. **Least privilege**: mặc định không thấy gì; muốn thấy phải được assign.
2. **Role trong repo giữ nguyên**: dùng lại `SUPER_ADMIN` / `ADMIN` / `USER` đã có từ sprint-01, không phát sinh role mới.
3. **Business-first docs**: PRD này chỉ mô tả hành vi nghiệp vụ; cách triển khai (DB schema, API, UI library) sẽ nằm trong sprint spec.

## Known risks & tech debt (phase 1)

> Các rủi ro đã nhận diện và chấp nhận ở MVP. Phase 2 phải giải quyết.

- **Password account test lưu plaintext**: quyết định phase 1 để ship nhanh. Rủi ro: DB leak 1 lần là lộ toàn bộ account test của mọi dự án. **Phase 2 bắt buộc** nâng cấp lên encrypted-at-rest (pgcrypto / column-level encryption) + mask-and-reveal-on-demand + audit log.
- **Chưa có audit log** xem account: không biết ai đã xem account nào khi nào. Với hệ thống kiểu này, compliance/security sẽ hỏi — nên đưa vào sớm (sprint-05 hoặc phase 2).
- **Chưa có SSO**: login bằng email/password của hệ thống này, không đồng bộ với Google Workspace công ty. Cân nhắc ở phase 2 nếu công ty yêu cầu.
