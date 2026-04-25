# Thuyết trình: SDD + AI Code Agent — Thực hành phương pháp phát triển phần mềm document-first

---

# Slide 1: Title Slide

**SDD + AI Code Agent**

Thực hành phương pháp phát triển phần mềm document-first

*Dự án minh hoạ: Internal Project & Test Account Vault*

> Speaker notes: Hôm nay tôi sẽ nói về hai thứ song song — một dự án nội bộ thực tế và cách chúng tôi build nó bằng phương pháp SDD kết hợp AI Code Agent. Dự án là context, SDD là bài học chính.

---

# Slide 2: Dự Án Là Gì? *(+ hình demo UI)*

**Internal Project & Test Account Vault**

Một web app nội bộ — nơi tập trung toàn bộ thông tin dự án và tài khoản test:

- 📋 Danh sách dự án + tech stack + môi trường
- 🔑 Tài khoản test gom nhóm theo môi trường (Dev / Staging / Prod)
- 👥 Phân quyền theo role — chỉ member của project mới thấy credentials
- ⚡ Nhân viên mới login → thấy ngay thông tin cần thiết, không cần hỏi ai

**Pain points trước khi có hệ thống:**
- Credentials rải rác trong Slack, Excel, Notion
- Nhân viên mới phải hỏi QC/team lead từng dự án một
- Không có audit trail — ai từng có quyền gì, khi nào?

---

**[ẢNH 1 — Screenshot UI: Trang Login hoặc Home Dashboard]**

> Speaker notes: Đây là sản phẩm sau 3 sprint. Tôi sẽ không đi sâu vào feature — mục tiêu slide này chỉ là để audience hình dung dự án trông như thế nào trước khi nói về cách build nó.

---

# Slide 3: Vấn Đề Với Cách Làm Truyền Thống

**"Code trước, document sau" — tại sao không work với AI agent?**

Cách làm thông thường:

- ❌ Developer code, document sau (hoặc không bao giờ document)
- ❌ Context nằm trong đầu người, không trên file
- ❌ AI agent hỏi liên tục vì thiếu thông tin
- ❌ Khó trace: "cái này tại sao làm vậy?"
- ❌ Onboard người mới mất thời gian giải thích miệng

**Hệ quả khi dùng AI agent theo cách cũ:**

> Bạn viết prompt ngắn → AI hỏi thêm → bạn giải thích → AI làm → thiếu edge case → sửa lại... lặp lại nhiều vòng.

**Câu hỏi đặt ra:**
> Làm sao để AI agent implement *đúng ngay từ đầu* mà không cần hỏi lại?

> Speaker notes: Vấn đề không phải AI kém — mà là context không đủ. Nếu spec rõ, plan rõ, AI làm đúng ngay lần đầu. SDD giải quyết điều này.

---

# Slide 4: SDD Là Gì?

**Sprint-Driven Development — Document-first, AI-agent-assisted**

**5 nguyên tắc cốt lõi:**

1. **Spec trước code** — Viết rõ WHAT và WHY trước khi code một dòng nào
2. **Plan trước implement** — Lock HOW: state machine, edge cases, trade-offs
3. **Task nhỏ, atomic** — Mỗi task ≤ 60 phút, output rõ ràng, có thể verify
4. **AI agent tự implement** — Đọc spec + plan + tasks → viết code, không cần hướng dẫn thêm
5. **History ghi ngay** — Mỗi task xong → log `04-history.md`, không gộp cuối sprint

**So sánh nhanh:**

| | Cách truyền thống | SDD |
|---|---|---|
| Document | Sau code (hoặc không có) | Trước code |
| AI agent | Hỏi liên tục | Tự implement |
| Trace lại | Khó | Đầy đủ trong history |
| Onboard người mới | Giải thích miệng | Đọc spec là hiểu |

> Speaker notes: SDD không hoàn toàn mới — nó kết hợp document-driven development với AI agent. Điểm khác biệt: spec + plan phải đủ tốt để AI không cần hỏi. Đây là "shift" quan trọng nhất khi làm việc với AI.

---

# Slide 5: Workflow — 6 Bước Từ Idea Đến History

```
1. PRODUCT DOCS
   ↓  Viết 1 lần — vision, personas, modules, user flows

2. SPRINT SPEC  →  01-spec.md
   ↓  User stories, acceptance criteria, API contract, DoD

3. BUSINESS PLAN  →  02-plan.md
   ↓  Lock decisions, state machine, edge cases, trade-offs

4. TASK BREAKDOWN  →  03-tasks.md
   ↓  Atomic tasks ≤ 60 min, tagged (B10, F20...), track song song

5. AI AGENT IMPLEMENT
   ↓  Claude Code đọc spec + plan + tasks → viết code
   ↓  Hỏi chỉ khi gặp action khó đảo ngược

6. HISTORY LOG  →  04-history.md
      Append ngay sau mỗi task: outcome / files / follow-up
```

**Quy tắc bất biến:** Bước 5 chỉ bắt đầu khi bước 2 + 3 đã lock.

> Speaker notes: Workflow này lặp lại mỗi sprint. Sprint đầu mất lâu hơn vì viết product docs. Từ sprint 2 trở đi chỉ viết sprint docs — product docs reuse.

---

# Slide 6: Cấu Trúc Tài Liệu 2 Tầng *(+ hình folder structure)*

**Tầng 1 — Product Docs** *(viết 1 lần, dùng cho toàn project)*

```
docs/product/
├── 00-vision.md              # Vấn đề + giá trị + guardrails
├── 01-personas-and-roles.md  # User personas + permission matrix
├── 02-modules.md             # Feature modules (ngôn ngữ business)
├── 03-user-flows.md          # Luồng nghiệp vụ
└── 04-roadmap.md             # Lộ trình sprint + business outcome
```

**Tầng 2 — Sprint Docs** *(5 files mỗi sprint)*

```
docs/sprints/sprint-03-test-account-vault/
├── 01-spec.md        # WHAT: user stories, acceptance criteria, API contract
├── 02-plan.md        # HOW: decisions locked, edge cases, trade-offs
├── 03-tasks.md       # Atomic checklist — tagged, track song song
├── 04-history.md     # Running log: task done, bug fixed, commit ref
└── 05-test-cases.md  # Test cases cho QA
```

---

**[ẢNH 2 — Chụp màn hình VSCode: folder tree docs/ và src/ cạnh nhau]**

> Speaker notes: Ảnh này cho thấy document và code song hành trong cùng một repo. Không phải Confluence hay Notion riêng — tất cả ở ngay trong project, AI agent đọc được trực tiếp.

---

# Slide 7: Nội Dung Từng File Sprint Doc

**01-spec.md — WHAT & Acceptance Criteria**
- User stories viết theo format chuẩn (US-01, US-02…)
- Acceptance criteria rõ ràng — không mơ hồ, không diễn giải tùy ý
- API contract (endpoint, request/response example)
- Definition of Done — checklist để đóng sprint

**02-plan.md — HOW & Locked Decisions**
- State machines cho flow phức tạp
- Permission rules (who can do what — ghi rõ ở cả FE và BE)
- Edge cases đã được quyết định trước
- *Tại sao chọn approach này* — ghi rõ để không debate lại

**03-tasks.md — Atomic Checklist**
- Mỗi task ≤ 60 phút, output có thể verify
- Task ID (B10, F20…) — reference trong history và PR
- Chia track song song: BE | FE-A | FE-B | QA

**04-history.md — Running Log**
- Append ngay sau mỗi task — không bao giờ gộp cuối sprint
- Format cố định: **Outcome / Files changed / Follow-up**
- Ghi lại quyết định thay đổi, bug phát sinh, commit ref

> Speaker notes: 02-plan.md là file quan trọng nhất với AI agent. Plan rõ → AI implement thẳng, không hỏi. Plan thiếu → AI tự quyết (có thể sai). Chất lượng spec quan trọng hơn số lượng.

---

# Slide 8: Rule Cho AI Agent — CLAUDE.md

**"Contract" giữa team và AI agent — đọc tự động mỗi session**

**✅ AI agent tự quyết định:**
- Viết code, fix bug, refactor trong scope task
- Run tests, fix lint / type error
- Hỏi khi requirement mơ hồ

**🔴 Phải hỏi trước khi làm:**
- Chạy database migration
- Force push / reset branch có người khác
- Gọi API ngoài (email, webhook prod)

**❌ Không bao giờ được phép:**
- Commit `.env`, credentials, private key
- Dùng `any` / `@ts-ignore` để tắt type check
- Bypass hook bằng `--no-verify`
- Mock DB trong integration test — phải test vs real DB
- Thêm abstraction "phòng tương lai" ngoài scope task

**Nguyên tắc chung:**
> *Hỏi thì chậm thêm 30 giây. Rollback migration production mất hơn thế rất nhiều.*

> Speaker notes: CLAUDE.md giúp AI hoạt động như senior dev cẩn thận — không chỉ làm nhanh, mà làm đúng và an toàn. User có thể override bằng cách explicit ghi trong prompt ("chạy migration đi") — nhưng phải explicit, AI không suy diễn ẩn ý.

---

# Slide 9: Thực Tế — Sprint 03 Diễn Ra Thế Nào? *(+ hình demo thêm nếu có)*

**Sprint 03: Test Account Vault + UI Redesign**

Tasks chia thành 3 track chạy song song:

**Track BE** — API + Database
- Model `TestAccount`, migration, seed data
- REST endpoints: list / detail / create / update / delete
- Permission middleware, rate limiting, error handling
- Integration tests vs real Postgres

**Track FE-A** — UI Redesign *(không cần API mới — chạy trước)*
- Design tokens: OKLCH colors, Inter Tight + JetBrains Mono
- Auth redesign: split layout, password strength meter, inline error banner
- App shell: AppHeader sticky, HomePage dashboard (stats grid, recent runs)
- Profile page: identity strip, edit form

**Track FE-B** — Vault UI *(chờ BE xong)*
- View accounts grouped by environment, password masked
- Copy credentials to clipboard
- Add / edit / delete — gated by role

---

**[ẢNH 3 — Screenshot UI thêm: trang account vault hoặc register form với design mới]** *(tuỳ chọn)*

> Speaker notes: FE-A chạy trước vì không cần API — redesign UI existing. FE-B phải chờ BE expose endpoints. Cách chia track này maximize parallelism — BE và FE làm song song, không block nhau.

---

# Slide 10: Kết Quả & Takeaway

**Sau 3 sprint với SDD + AI agent:**

✅ Sprint 01 — Auth: register, login, profile, logout
✅ Sprint 02 — Project Management: CRUD project, manage members
🔄 Sprint 03 — Test Account Vault + UI Redesign *(in progress)*

---

**Điều thực sự học được:**

1. **Spec chất lượng quan trọng hơn spec nhiều** — AI làm đúng khi spec rõ, không phải khi spec dài
2. **Document là công cụ giao tiếp với AI** — không phải overhead, không phải formalilty
3. **History log có giá trị thực** — trace bug, onboard, audit đều dùng đến
4. **CLAUDE.md giảm friction rõ rệt** — AI không hỏi lại những quyết định đã có sẵn trong doc

---

**Key message:**

> *Chúng ta không "dùng AI để code nhanh hơn".*
> *Chúng ta thay đổi cách viết spec để AI có thể làm đúng ngay từ đầu.*

> Speaker notes: Shift quan trọng nhất là từ "AI là công cụ gõ code" sang "AI là developer cần được briefing rõ ràng". Khi spec đủ tốt, AI implement không khác gì một developer đọc hiểu yêu cầu.

---

# Slide 11: Q&A

**Một số câu hỏi thường gặp:**

**Q: SDD có phù hợp với team nhỏ / solo developer không?**
A: Phù hợp nhất với solo hoặc team nhỏ — overhead thấp, benefit cao vì AI làm phần lớn implement

**Q: Tốn bao lâu để viết spec + plan mỗi sprint?**
A: Sprint đầu ~1–2 ngày (có product docs). Từ sprint 2: ~4–8 giờ cho spec + plan

**Q: Nếu requirement thay đổi giữa sprint?**
A: Update spec + plan trước, AI implement theo version mới. History ghi rõ lý do thay đổi

**Q: AI có thể làm tất cả, hay vẫn cần dev review?**
A: Vẫn cần review — đặc biệt với business logic phức tạp, security, migration. AI làm tốt implement, con người review và quyết định

**Q: Tại sao không dùng Cursor / Copilot?**
A: Claude Code đọc được toàn bộ codebase + file docs trong 1 session — phù hợp với document-first workflow của SDD

> Speaker notes: Tập trung vào methodology, không phải feature của app. Nếu ai hỏi tech stack: React + TypeScript + Node + Postgres — nhưng đó không phải điểm chính của buổi này.

---

# Ghi Chú Cho Presenter

- **Thời lượng**: ~15 phút + Q&A
- **Audience**: Team, peer, hoặc ai quan tâm đến AI-assisted development
- **Key message**: *"Viết doc tốt hơn → AI làm đúng hơn — không phải prompt tốt hơn"*
- **Hình ảnh cần chuẩn bị**:
  - Ảnh 1 (Slide 2): Screenshot UI — trang Login hoặc Home Dashboard
  - Ảnh 2 (Slide 6): VSCode sidebar — folder tree `docs/` và `src/` cạnh nhau
  - Ảnh 3 (Slide 9, tuỳ chọn): Screenshot thêm — account vault hoặc register form
- **Tránh**: Đi sâu vào roles/permissions/KPI — giữ focus vào methodology
