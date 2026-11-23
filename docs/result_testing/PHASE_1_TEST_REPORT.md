# PHASE 1 — Test & acceptance report

**Date:** 2026-11-23  
**Reviewer:** Cursor agent (code review + live tests)  
**Scope:** Phase 1 — PostgreSQL, project/scene CRUD, dashboard UI (excludes Phase 2 AI)

---

## 1. Tổng quan

Phase 1 delivers a local studio user, Prisma models, Nest REST API with Zod validation, and a Next.js dashboard with project creation and basic storyboard scene add. Architecture matches `AGENTS.md` (strict TS, Zod at API boundaries, local-first, no mock AI in production paths). Phase 0 endpoints (`/health`, `/v1/ollama/status`) remain available.

During acceptance testing, **one blocking UI defect** (CORS when opening web at `127.0.0.1:3000`) and **one API lint failure** were found and fixed in-scope. PostgreSQL connectivity probe `GET /v1/system/db` was added to support acceptance criteria.

---

## 2. Files đã kiểm tra (đọc / review)

| Area | Paths |
|------|--------|
| Database | `packages/database/prisma/schema.prisma`, `migrations/*`, `seed.ts`, `src/prisma.ts` |
| Validation | `packages/validation/src/project.ts`, `scene.ts`, `index.ts` |
| API | `apps/api/src/projects/*`, `scenes/*`, `users/*`, `prisma/*`, `common/pipes/zod-validation.pipe.ts`, `system/*`, `app.module.ts`, `main.ts` |
| Web | `apps/web/src/app/page.tsx`, `projects/new/page.tsx`, `projects/[publicId]/page.tsx`, `lib/api.ts`, `providers.tsx` |
| Docs | `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/API_SPEC.md`, `docs/DATABASE.md`, `README.md` |
| Tests | `apps/api/test/projects.e2e-spec.ts`, `projects.service.spec.ts` |

---

## 3. Kiến trúc vs AGENTS.md / docs

| Rule | Status |
|------|--------|
| Strict TypeScript | **PASS** — `pnpm typecheck` 15/15 packages |
| Zod at API boundaries | **PASS** — `ZodValidationPipe` + `packages/validation` |
| No cloud AI in prod paths | **PASS** — unchanged Ollama probe only |
| Mock LLM not used as success | **PASS** — no AI generation in Phase 1 |
| Binaries not in PostgreSQL | **PASS** — schema has text/json only |
| Business logic in services | **PASS** — thin controllers |
| `.env` root for Prisma | **PASS** — `dotenv-cli` in database scripts |

**Gaps vs original Phase 1 spec:** shadcn/ui not installed (custom Tailwind UI); Redis/BullMQ not wired (Phase 6); no authentication (single seeded local user by design).

---

## 4. Lỗi / risks phát hiện

| ID | Severity | Mô tả |
|----|----------|--------|
| P1-001 | **High** | CORS chỉ `http://localhost:3000` → truy cập `http://127.0.0.1:3000` → dashboard **Failed to fetch** |
| P1-002 | **Medium** | ESLint `@typescript-eslint/no-unused-vars` in `zod-validation.pipe.ts` → `pnpm lint` fail API |
| P1-003 | **Medium** | Không có endpoint kiểm tra DB trong acceptance run ban đầu |
| P1-004 | **Low** | E2E/integration thiếu cho projects (chỉ unit mock) |
| P1-005 | **Low** | UI không chỉnh sửa scene/narration (chỉ Add scene); PATCH API có nhưng chưa có form |
| P1-006 | **Info** | Không auth — mọi client local gọi API đều thấy projects của user seeded |
| P1-007 | **Info** | `pnpm lint` ở package stub = `echo "lint pending"` (không thật sự lint) |
| P1-008 | **Info** | Jest/ts-jest cảnh báo compile `.js` workspace dist |
| P1-009 | **Info** | `prisma migrate dev` có thể P1002 advisory lock nếu session cũ treo |

**Security:** Chấp nhận được cho local MVP; không expose ra LAN mặc định (`API_HOST=127.0.0.1`).

**Performance:** CRUD đơn giản, không vấn đề tại quy mô hiện tại.

---

## 5. Lỗi đã sửa (trong review)

| ID | Fix |
|----|-----|
| P1-001 | `main.ts` + `.env.example` + `.env`: CORS nhiều origin (`localhost` + `127.0.0.1`) |
| P1-002 | `zod-validation.pipe.ts`: dùng `void metadata` thay `_metadata` |
| P1-003 | Thêm `GET /v1/system/db` + `docs/API_SPEC.md` |
| P1-004 | Thêm `apps/api/test/projects.e2e-spec.ts` (PostgreSQL thật) |

---

## 6. Kết quả từng loại test

### Lint

| Run | Result |
|-----|--------|
| **Trước fix** | **FAIL** — `@ai-video-studio/api` ESLint 1 error |
| **Sau fix** (`pnpm lint`) | **PASS** — 12 tasks; web `next lint` clean; API eslint clean |

*Note:* 8 packages vẫn chỉ stub `lint pending` — **not full monorepo ESLint coverage**.

### Typecheck

`pnpm typecheck` — **PASS** (15/15 tasks, 2026-11-23 final run)

### Unit tests

`pnpm --filter @ai-video-studio/api test` — **PASS**

- 2 suites, 2 tests (`app.controller`, `projects.service` mock)

### Integration / E2E (PostgreSQL thật, không mock CRUD)

`pnpm --filter @ai-video-studio/api test:e2e` — **PASS**

- 2 suites, 6 tests: health, create/list project, create scene + locales, validation 400

### API live (server đang chạy `127.0.0.1:3001`)

| Endpoint | Result |
|----------|--------|
| `GET /health` | **PASS** `status: ok` |
| `GET /v1/system/info` | **PASS** `phase: 1` |
| `GET /v1/system/db` | **PASS** `connected: true` |
| `GET /v1/ollama/status` | **PASS** reachable (models empty trên máy test) |
| `GET /v1/projects` | **PASS** trả danh sách thật từ DB |
| `POST /v1/projects` (manual trước đó) | **PASS** |
| UI-driven create + scene | **PASS** qua browser |

### UI (browser, API + web dev)

| Case | Result |
|------|--------|
| Dashboard `http://localhost:3000` | **PASS** — liệt kê projects |
| Create project form → detail | **PASS** — project "QA Phase 1" |
| Add scene | **PASS** — Scene 1, locales `vi` / `en` |
| Dashboard `http://127.0.0.1:3000` before CORS fix | **FAIL** — Failed to fetch |
| Dashboard `http://127.0.0.1:3000` after CORS fix | **PASS** *sau khi restart API* (cần user restart nếu instance cũ) |

### Phase 0 regression

| Check | Result |
|-------|--------|
| `/health` | **PASS** |
| `/v1/ollama/status` | **PASS** |

---

## 7. Build result

`pnpm build` (final run) — **PASS** — 11/11 packages, Next.js production build OK.

---

## 8. Acceptance criteria (Phase 1 scope)

Criteria mapped from project plan; **not** full end-MVP (AI/Redis/TTS).

| # | Criterion | Result |
|---|-----------|--------|
| AC-1 | Prisma schema + migrations applied | **PASS** (`db:deploy` + migration on disk) |
| AC-2 | PostgreSQL used for projects/scenes | **PASS** (e2e + live API) |
| AC-3 | Project CRUD API | **PASS** (e2e; DELETE not in e2e but implemented) |
| AC-4 | Scene CRUD + localization API | **PARTIAL** — create/update API **PASS**; UI chỉ add scene |
| AC-5 | Dashboard + create project UI | **PASS** (live browser) |
| AC-6 | Zod validation on API | **PASS** (400 on invalid POST) |
| AC-7 | No auth (local user) documented | **PASS** |
| AC-8 | Automated tests run | **PASS** (unit + e2e) |
| AC-9 | Monorepo build | **PASS** |
| AC-10 | Docs updated | **PASS** (API_SPEC, DATABASE, TESTING, README) |

---

## 9. Vấn đề còn tồn tại

1. **Restart API** sau CORS change nếu đang chạy build cũ.
2. **Storyboard editor** — chưa edit/save narration trên UI (Phase 2).
3. **shadcn/ui** — chưa scaffold (Tailwind custom).
4. **Redis** — chưa tích hợp (không thuộc Phase 1).
5. **Package lint stubs** — cần ESLint thật trước Phase 7.
6. **E2E web (Playwright)** — chưa có.
7. **`db:migrate dev`** — có thể lock; ưu tiên `db:deploy` trên CI.

---

## 10. Đánh giá chuyển Phase 2

| Verdict | **CONDITIONAL GO** → **Phase 1 completed 2026-11-23 (follow-up)** |
|---------|-------------------|
| Rationale | Ban đầu CONDITIONAL GO; đã bổ sung storyboard editor đầy đủ, DELETE scene, dashboard stats, script draft UI, shadcn/ui. Sẵn sàng **Phase 2** sau restart API. |

**Không** đánh dấu toàn bộ end-MVP PASS — AI script, storyboard generation, Redis, TTS thuộc Phase 2+.

---

## 11. Checklist tái kiểm tra (người dev)

```powershell
pnpm install
pnpm db:deploy
pnpm db:seed
pnpm build
pnpm lint
pnpm typecheck
pnpm --filter @ai-video-studio/api test
pnpm --filter @ai-video-studio/api test:e2e
# terminal A: pnpm --filter @ai-video-studio/api start:dev
# terminal B: pnpm --filter @ai-video-studio/web dev
```

Chi tiết: [docs/TESTING.md](../TESTING.md)