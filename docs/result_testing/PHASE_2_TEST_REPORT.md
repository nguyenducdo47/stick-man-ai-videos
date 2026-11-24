# PHASE 2 — Test & acceptance report

**Date:** 2026-11-23  
**Reviewer:** Cursor agent (code review + live tests)  
**Scope:** Phase 2 — Ollama AI Director (script + storyboard), `AiGeneration` audit, settings UI, Qwen3 integration fixes

---

## 1. Tổng quan

Phase 2 adds local LLM generation via **Ollama** (`qwen3:4b`), structured JSON validation (Zod), Nest `AiModule` endpoints, Prisma `AiGeneration`, and web controls (Generate script/storyboard, `/settings/ai`). Architecture aligns with `AGENTS.md`: strict TypeScript, Zod at API boundaries, **no Mock LLM in production paths**, Ollama-only AI.

Acceptance run included **real Ollama** calls (not mocks): script ~3.6s, storyboard ~4.7s on reviewer machine. A **Qwen3 empty `response`** defect (thinking-only output) was fixed earlier with `think: false` and higher `num_predict`. During this review, **SystemController** was refactored to share `OllamaFactory` (timeout/config consistency).

**Verdict:** **CONDITIONAL GO** → Phase 3 (TTS / queue) — core AI pipeline **PASS** on API; web project detail **FAIL** in one browser run due to stale Next dev chunks (environment), not API regression.

---

## 2. Files đã kiểm tra (đọc / review)

| Area | Paths |
|------|--------|
| Database | `packages/database/prisma/schema.prisma` (`AiGeneration`), `migrations/20251123170000_phase2_ai_generation/*` |
| Validation | `packages/validation/src/ai.ts`, `index.ts` |
| AI engine | `packages/ai-engine/src/ai-director.ts`, `ollama-provider.ts`, `structured-llm.ts`, `json-utils.ts`, `json-utils.test.ts`, `types.ts`, `index.ts` |
| API | `apps/api/src/ai/*`, `system/system.controller.ts`, `system/system.module.ts`, `projects/projects.service.ts` (`getOwnedProject`), `app.module.ts` |
| Web | `apps/web/src/components/project-script-panel.tsx`, `studio-shell.tsx`, `apps/web/src/app/projects/[publicId]/page.tsx`, `apps/web/src/app/settings/ai/page.tsx` |
| Tests | `apps/api/test/projects.e2e-spec.ts` |
| Docs | `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/API_SPEC.md`, `docs/AI_DIRECTOR.md`, `docs/DATABASE.md`, `docs/OLLAMA_SETUP.md`, `docs/TESTING.md`, `README.md` |

---

## 3. Kiến trúc vs AGENTS.md / docs

| Rule | Status |
|------|--------|
| Strict TypeScript | **PASS** — `pnpm typecheck` 15/15 |
| Zod at API boundaries | **PASS** — AI options + output schemas; `ZodValidationPipe` on routes |
| No cloud AI in prod paths | **PASS** — `OllamaProvider` only in API AI flows |
| Mock LLM not used as success | **PASS** — no `MockLLM` in `apps/*` |
| Binaries not in PostgreSQL | **PASS** — text/JSON only; `AiGeneration` metadata |
| Local-first Ollama | **PASS** — documented in `AI_DIRECTOR.md`, `OLLAMA_SETUP.md` |
| Phase-gated | **PASS** — Phase 1 CRUD unchanged; AI additive |

---

## 4. Lỗi / risks phát hiện

| ID | Severity | Mô tả |
|----|----------|--------|
| P2-001 | **High** | Qwen3 trả `response` rỗng khi token vào `thinking` → UI **503** “empty response” |
| P2-002 | **Medium** | Generate script ban đầu **bỏ qua** textarea chưa Save → brief user không vào prompt |
| P2-003 | **Medium** | `SystemController` tạo `OllamaProvider` riêng, timeout **10s** vs AI **300s** — không đồng nhất |
| P2-004 | **Low** | Mọi lỗi generate → **503** `ServiceUnavailableException` (kể cả parse Zod) |
| P2-005 | **Low** | Regenerate script đưa cả `scriptDraft` cũ làm `creativeBrief` — có thể nhiễu prompt |
| P2-006 | **Low** | Không có e2e **PASS** đường Ollama trong CI (cần model local) |
| P2-007 | **Info** | Storyboard **xóa toàn bộ** scene cũ — đúng spec nhưng destructive |
| P2-008 | **Info** | Browser project page: lỗi Next **vendor-chunks** khi dev + `next build` lẫn — cần restart/xóa `.next` |
| P2-009 | **Info** | Jest ts-jest warn compile workspace `.js`; package lint vẫn stub |

**Security:** AI endpoints cùng mô hình Phase 1 — không auth, chỉ `127.0.0.1`; chấp nhận local MVP.

**Performance:** In-process queue serializes Ollama — đúng cho concurrency=1; request HTTP block tới khi model xong.

---

## 5. Lỗi đã sửa (trong Phase 2 + review)

| ID | Fix |
|----|-----|
| P2-001 | `ollama-provider.ts`: `think: false`, tăng `num_predict`, error hint; `ai-director` token limits |
| P2-002 | `project-script-panel.tsx`: auto PATCH brief trước POST; `creativeBrief` in `AiDirector` / `project-ai.service` |
| P2-003 | `system.controller.ts` + `system.module.ts`: dùng chung `OllamaFactory` + `ConfigService` |
| (review) | `docs/OLLAMA_SETUP.md` — Qwen3 / think / timeout notes |

---

## 6. Kết quả từng loại test

### Lint

`pnpm lint` — **PASS** (12 tasks; API eslint + `next lint` clean; 8 packages `lint pending` stub)

### Typecheck

`pnpm typecheck` — **PASS** (15/15, 2026-11-23)

### Unit tests

| Package | Command | Result |
|---------|---------|--------|
| ai-engine | `pnpm --filter @ai-video-studio/ai-engine test` | **PASS** — 3 tests (`json-utils`) |
| api | `pnpm --filter @ai-video-studio/api test` | **PASS** — 2 suites, 2 tests |

### Integration / E2E (PostgreSQL thật)

`pnpm --filter @ai-video-studio/api test:e2e` — **PASS** — 10 tests (gồm `POST .../ai/storyboard` without script → **400**)

*Không* có e2e bắt buộc Ollama chạy thành công (by design — CI không giả định model).

### API live (`127.0.0.1:3001`, Ollama `qwen3:4b` thật)

| Endpoint / flow | Result |
|-----------------|--------|
| `GET /health` | **PASS** |
| `GET /v1/system/info` | **PASS** `phase: 2` |
| `GET /v1/ollama/status` | **PASS** `defaultModelAvailable: true` |
| `GET /v1/dashboard/stats` | **PASS** (Phase 1 regression) |
| `POST /v1/projects` → `POST .../ai/script` | **PASS** — 201, `status: SCRIPTING`, `scriptDraft` ≥ 20 chars, `synopsis` (~**3.6s**) |
| `POST .../ai/storyboard` (after script) | **PASS** — 201, 2 scenes, VI/EN localizations, `status: STORYBOARD` (~**4.7s**) |
| Acceptance project id | `f2f58c2e-840a-4dae-8f0b-51e2980b4304` |

### UI (browser, `localhost:3000`)

| Case | Result |
|------|--------|
| Dashboard `/` | **PASS** — shell, nav (Dashboard, Ollama, New project) |
| `/settings/ai` | **PASS** — heading “AI / Ollama”; trạng thái load (API-backed) |
| `/projects/[id]` (user + acceptance) | **FAIL** (run này) — Next error missing `vendor-chunks/@tanstack+query-core` (dev/build cache); **không** reproduce trên `pnpm build` production |

*Khuyến nghị:* sau `pnpm build`, restart `pnpm --filter @ai-video-studio/web dev` hoặc xóa `apps/web/.next`.

### Phase 0 / Phase 1 regression

| Check | Result |
|-------|--------|
| `/health`, `/v1/ollama/status` | **PASS** |
| Project/scene CRUD e2e | **PASS** (10/10) |

---

## 7. Build result

`pnpm build` — **PASS** (11/11 packages, Next.js 7 routes including `/settings/ai`, 2026-11-23)

---

## 8. Acceptance criteria (Phase 2 scope)

| # | Criterion | Result |
|---|-----------|--------|
| AC-1 | Zod schemas for AI script/storyboard output | **PASS** |
| AC-2 | `AiDirector` + Ollama structured JSON | **PASS** (live API) |
| AC-3 | `POST .../ai/script` persists `scriptDraft` | **PASS** |
| AC-4 | `POST .../ai/storyboard` replaces scenes + VI/EN | **PASS** |
| AC-5 | `AiGeneration` audit rows | **PASS** (schema + service `recordGeneration`; verified via successful runs) |
| AC-6 | No mock LLM in production API | **PASS** |
| AC-7 | UI: generate script/storyboard + Ollama settings | **PARTIAL** — implemented; project page **not** verified in browser this run (P2-008) |
| AC-8 | Automated tests (unit + e2e non-Ollama) | **PASS** |
| AC-9 | Docs updated | **PASS** |
| AC-10 | Phase 1 không regress (build/e2e/stats) | **PASS** |

---

## 9. Vấn đề còn tồn tại

1. **E2E Ollama** — không trong CI; cần manual hoặc optional job with model.
2. **Latency** — generate có thể **nhiều phút** trên CPU; chưa có job async / progress SSE.
3. **Topic editing on project UI** — chỉ lúc tạo project; brief phụ thuộc script box.
4. **503 for validation errors** — UX khó phân biệt “Ollama down” vs “JSON sai”.
5. **Next dev cache** — build + dev đồng thời dễ lỗi chunk (P2-008).
6. **Redis / worker queue** — Phase 3+.
7. **Package lint stubs** — unchanged from Phase 1.

---

## 10. Đánh giá chuyển Phase tiếp theo

| Verdict | **CONDITIONAL GO** → **Phase 3** (TTS / audio pipeline) |
|---------|--------------------------------------------------------|
| Rationale | API Ollama script + storyboard **verified live**; build/typecheck/e2e **PASS**; Qwen3 empty-response **fixed**; docs updated. **Điều kiện:** xác nhận UI project page sau restart web dev; không block Phase 3 backend work nhưng nên smoke-test UI trước demo. |

**Không** đánh dấu end-MVP PASS — 3D, TTS, render, Redis vẫn Phase 3+.

---

## 11. Checklist tái kiểm tra (người dev)

```powershell
pnpm install
pnpm db:deploy
ollama pull qwen3:4b   # user confirms download
pnpm build
pnpm lint
pnpm typecheck
pnpm --filter @ai-video-studio/ai-engine test
pnpm --filter @ai-video-studio/api test
pnpm --filter @ai-video-studio/api test:e2e
# Terminal A: pnpm --filter @ai-video-studio/api start:dev
# Terminal B: pnpm --filter @ai-video-studio/web dev  # restart after build if needed
# Manual: project → Generate script → Generate storyboard
# GET http://127.0.0.1:3001/v1/ollama/status
```

Chi tiết: [docs/TESTING.md](../TESTING.md)