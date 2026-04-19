# CLAUDE.md — Rules tổng cho AI agent

> File này được Claude Code tự động đọc mỗi session. Mọi rule ở đây **áp dụng cho cả FE + BE**, trừ khi có prefix `[FE]` / `[BE]`.
> Luôn đọc kèm [FRONTEND.md](./FRONTEND.md) + [BACKEND.md](./BACKEND.md) để nắm convention kỹ thuật.

## Nguyên tắc vàng

1. **Hỏi trước khi làm điều khó đảo ngược.** Bất cứ action nào có thể mất dữ liệu / phá branch / ảnh hưởng shared state → confirm với user.
2. **Không "dọn dẹp" ngoài scope task.** Task bug fix không kèm refactor. Không rename biến ngoài file đang sửa.
3. **Root cause > workaround.** Gặp lỗi phải tìm nguyên nhân, không bypass (`--no-verify`, skip test, try/catch nuốt lỗi).
4. **Test thật, không mock DB / API prod.** Integration test phải hit Postgres thật (local `aiTest`).
5. **Log mọi thay đổi vào `04-history.md`** của sprint tương ứng — fix bug, task code done, design schema / tech doc mới, quyết định nghiệp vụ thay đổi. Làm **ngay khi xong**, không gộp cuối sprint. Format entry theo mẫu có sẵn (Outcome / Files / Follow-up). Bug phát sinh ở sprint cũ nhưng fix ở sprint mới → log vào **cả hai** history để trace hai chiều.

## DON'T — Tuyệt đối không được làm

### Database & Data

- ❌ **Không tự chạy migration** (`sequelize-cli db:migrate`, `prisma migrate deploy`, raw `ALTER TABLE` in production config). Migration luôn do user chạy thủ công.
- ❌ **Không `sequelize.sync({ force: true })`** — sẽ drop hết table.
- ❌ **Không chạy script update/delete bulk data** (`UPDATE users SET...`, `DELETE FROM...` không WHERE) kể cả khi user paste SQL — luôn confirm lại.
- ❌ **Không seed data đè lên DB đã có data thật** — chỉ seed khi `count() === 0`.
- ❌ **Không export / dump DB** ra file ngoài repo mà không hỏi.
- ❌ **Không hardcode credential** (`JWT_SECRET`, `DATABASE_URL` password) vào source — luôn qua `.env`.

### Git & Version Control

- ❌ **Không `git push --force`** lên `main`/`master`/branch có người khác.
- ❌ **Không `git reset --hard`, `git clean -fd`, `branch -D`** khi chưa confirm — có thể mất work đang làm dở.
- ❌ **Không amend commit đã push.**
- ❌ **Không commit** khi user chưa explicit yêu cầu "commit" / "tạo PR".
- ❌ **Không commit file `.env*`, `*.key`, `*.pem`, credential JSON.**
- ❌ **Không skip hooks** (`--no-verify`, `--no-gpg-sign`) — hook fail phải fix gốc.

### Dependencies & Build

- ❌ **Không tự `npm update` / bump major version** packages — breaking change khó predict.
- ❌ **Không xóa package** trong `package.json` khi chưa confirm không còn chỗ dùng.
- ❌ **Không switch package manager** (npm → pnpm/yarn) nếu user không yêu cầu.
- ❌ **Không disable TypeScript strict / ESLint rule** để "cho pass" — fix code thay vì tắt check.

### Code quality

- ❌ **Không viết comment thừa** (`// increment counter` cho `count++`). Chỉ comment khi giải thích **WHY non-obvious**.
- ❌ **Không tạo file markdown docs** (`README.md`, `NOTES.md`) nếu user không yêu cầu.
- ❌ **Không thêm error handling cho case không xảy ra** (trust internal code).
- ❌ **Không thêm feature flag / backward-compat shim** khi có thể sửa thẳng.
- ❌ **Không dùng `any`, `@ts-ignore`, `@ts-expect-error`** để bypass type — fix type đúng.
- ❌ **Không thêm abstraction cho "tương lai"** — 3 dòng lặp OK hơn premature abstraction.

### External systems

- ❌ **Không gọi API ngoài** (OpenAI, email, SMS, webhook prod) khi chưa confirm.
- ❌ **Không upload code / log** lên pastebin, gist, diagram tool online (có thể leak secret).
- ❌ **Không sửa CI/CD config** (`.github/workflows/`) nếu task không liên quan CI.

---

## [FE] Rules riêng Frontend

- ❌ **Không bỏ qua i18n** — mọi string UI phải qua `t('key')`, không hardcode tiếng Việt/Anh.
- ❌ **Không fetch API trong component** — luôn qua service layer + Zustand/TanStack Query.
- ❌ **Không dùng `any` trong props** — define interface rõ ràng.
- ❌ **Không `useEffect` để sync state** — dùng derived state hoặc event handler.
- ❌ **Không inline style** `style={{...}}` cho design token — dùng Tailwind/CSS variable.
- ❌ **Không bypass `ProtectedRoute` / `useHasPermission`** — mọi action nhạy cảm phải qua permission check.
- ❌ **Không lưu token vào `localStorage`** — dùng httpOnly cookie + memory (access token).
- ❌ **Không commit `console.log`** — dùng logger wrapper hoặc xóa trước commit.
- ✅ **Form bắt buộc:** `react-hook-form` + Zod resolver, không tự handle state input.

## [BE] Rules riêng Backend

- ❌ **Không trả stack trace cho client** trong production — chỉ `{ error: { code, message } }`.
- ❌ **Không log password, token, PII** — pino redaction đã config, không tắt.
- ❌ **Không raw SQL khi có model** — dùng Sequelize. Raw SQL chỉ khi health check / report phức tạp.
- ❌ **Không bỏ `asyncHandler`** cho async route — unhandled promise sẽ crash.
- ❌ **Không skip `requireAuth` / `requireRole`** trên route nhạy cảm.
- ❌ **Không `User.create()` trực tiếp trong route** — qua `userStore` / service layer.
- ❌ **Không mutate `req.user`** — read-only sau middleware.
- ❌ **Không tăng JWT TTL quá 15min** cho access token — dùng refresh rotation.
- ❌ **Không disable rate limiter** trên `/auth/*`.
- ✅ **Error bắt buộc:** throw `AppError` subclass, không `throw new Error(...)` trần.

---

## Escape hatches — Khi nào được phá rule

User phải **explicit** trong prompt:

- "chạy migration đi" → được migrate
- "force push giúp tôi" → được force push (nhưng warn nếu là `main`)
- "tôi biết, cứ commit .env đi" → được commit (nhưng hỏi lại 1 lần)

**Không suy diễn ẩn ý.** Nếu user nói "fix cho xong" mà cách nhanh nhất là bypass rule → vẫn hỏi trước.

---

## Khi không chắc

> **Measure twice, cut once.** Hỏi còn rẻ hơn rollback.
