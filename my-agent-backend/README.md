# my-agent-backend

Scaffold theo [BACKEND.md](../BACKEND.md) — Express + TypeScript + Auth module đầy đủ.

## Chạy

```bash
npm install
npm run dev
```

Server tại `http://localhost:8000`. Seed sẵn 2 user:

| Email                | Password       | Role  |
|----------------------|----------------|-------|
| admin@example.com    | `Admin@12345`  | admin |
| user@example.com     | `User@12345`   | user  |

## Test auth flow

```bash
BASE=http://localhost:8000/api

# Register
curl -X POST $BASE/auth/register -H "Content-Type: application/json" -c cookies.txt \
  -d '{"email":"new@example.com","name":"New","password":"Secret@12345"}'

# Login (set refresh cookie)
curl -X POST $BASE/auth/login -H "Content-Type: application/json" -c cookies.txt \
  -d '{"email":"admin@example.com","password":"Admin@12345"}'

# /me (Bearer)
curl $BASE/auth/me -H "Authorization: Bearer <ACCESS_TOKEN>"

# Refresh (dùng cookie)
curl -X POST $BASE/auth/refresh -b cookies.txt -c cookies.txt

# Logout (revoke access jti)
curl -X POST $BASE/auth/logout -H "Authorization: Bearer <ACCESS_TOKEN>" -b cookies.txt

# Protected endpoints
curl $BASE/profile      -H "Authorization: Bearer <TOKEN>"  # cần login
curl $BASE/admin-only   -H "Authorization: Bearer <TOKEN>"  # cần role admin+
curl $BASE/user-manage  -H "Authorization: Bearer <TOKEN>"  # cần permission user:manage
```

## Auth module — `src/auth/`

```
auth/
├── index.ts                     Public API (barrel)
├── routes.ts                    /register /login /refresh /logout /me
├── constants.ts                 ROLES · PERMISSIONS · ROLE_PERMISSIONS · TTL
├── types.ts                     JwtPayload · AuthUser · TokenPair
├── errors.ts                    Auth-specific AppError subclasses
├── controllers/AuthController.ts
├── services/
│   ├── AuthService.ts           register · login · refresh
│   ├── TokenService.ts          issue · verifyAccess · rotate (family revoke)
│   └── PasswordService.ts       argon2id hash/verify
├── middlewares/
│   ├── requireAuth.ts           Bearer + blacklist check
│   ├── requireRole.ts           RBAC theo role
│   ├── requirePermission.ts     Fine-grained permission
│   ├── optionalAuth.ts          Attach req.user nếu có, không throw
│   └── authRateLimiter.ts       Brute-force guard (IP + email)
├── schemas/login.schema.ts      Zod validators
├── stores/
│   ├── userStore.ts             ⚠️ in-memory → swap Sequelize `User` model
│   ├── refreshTokenStore.ts     ⚠️ in-memory → swap Redis
│   └── revokedTokenStore.ts     ⚠️ in-memory → swap Redis
└── utils/
    ├── hash.ts                  argon2id + sha256
    └── cookie.ts                httpOnly Secure SameSite=Strict
```

### Security features đã có

- argon2id password hash (memoryCost 64MB, timeCost 3, parallelism 4)
- Access token JWT HS256 TTL 15 phút + Hasura claims
- Refresh token opaque random 48 bytes, httpOnly Secure SameSite=Strict cookie
- Refresh token **SHA-256 hash** khi lưu
- Refresh rotation + family tracking → reuse detection
- Access token blacklist (jti) khi logout
- Rate limiter login theo IP + email (5 fail / 15 phút / email)
- Timing-constant login verify (hash dummy khi user không tồn tại)
- Helmet + CORS credentials
- Zod env + request validation

### Swap sang production

| In-memory store          | Production               |
|--------------------------|--------------------------|
| `userStore`              | Sequelize model `User` + Postgres |
| `refreshTokenStore`      | Redis `refresh:<hash>` + TTL      |
| `revokedTokenStore`      | Redis `revoked:<jti>` + TTL       |
| `authRateLimiter` bucket | `rate-limiter-flexible` + Redis   |

## Chưa có (mở rộng theo BACKEND.md khi cần)

- Sequelize + Postgres migrations
- Hasura client + codegen + event handlers
- BullMQ queues + workers + cron
- 2FA (TOTP) · OAuth (Google/GitHub) · password reset email
- Sentry
- Tests (Jest/Vitest)
