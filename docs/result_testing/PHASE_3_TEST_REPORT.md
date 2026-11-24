# PHASE 3 — Test & acceptance report

**Date:** 2026-11-24  
**Reviewer:** Cursor agent (code review + live tests)  
**Scope:** Phase 3 — Stickman scene graph (`animation-engine`), API compile/save, Three.js preview UI, storage under `data/`

---

## 1. Tổng quan

Phase 3 compiles PostgreSQL storyboard rows into a **versioned scene graph** JSON (Zod), exposes REST compile endpoints, persists artifacts to **`data/projects/<uuid>/scene-graph.v1.json`**, and adds a **WebGL stickman preview** on the project page. Aligns with `AGENTS.md` (strict TS, Zod boundaries, binaries in `data/` not PostgreSQL). Phase 1 CRUD and Phase 2 Ollama flows remain unchanged.

During acceptance, **blocking defects** were found and fixed: circular `storage` import + `path.resolve` crash on save; `.next` build cache; `STORAGE_ROOT` resolving under `apps/api/data` instead of repo `data/`.

**Verdict:** **GO** → Phase 4 (local TTS / `audio-engine`).

---

## 2. Files đã kiểm tra (đọc / review)

| Area | Paths |
|------|--------|
| Animation | `packages/animation-engine/src/*`, `build-scene-graph.test.ts` |
| Validation | `packages/validation/src/scene-graph.ts` |
| Storage | `packages/storage/src/project-paths.ts`, `resolve-data-root.ts` |
| API | `apps/api/src/preview/*`, `app.module.ts`, `system.controller.ts` |
| Web | `scene-graph-panel.tsx`, `scene-graph-canvas.tsx`, `stickman-figure.tsx`, `not-found.tsx`, `next.config.ts`, `package.json` (prebuild) |
| Tests | `apps/api/test/projects.e2e-spec.ts` |
| Docs | `STICKMAN_3D.md`, `API_SPEC.md`, `ARCHITECTURE.md`, `TESTING.md`, `README.md` |

---

## 3. Kiến trúc vs AGENTS.md / docs

| Rule | Status |
|------|--------|
| Strict TypeScript | **PASS** — typecheck 17/17 tasks |
| Zod at API boundaries | **PASS** — `sceneGraphResponseSchema`, graph document |
| No mock AI in prod | **PASS** — Phase 3 has no LLM |
| Binaries in `data/` | **PASS** — scene graph JSON on disk |
| Phase-gated | **PASS** — no TTS/Redis in this phase |
| Local-first | **PASS** — preview client-side Three.js |

---

## 4. Lỗi / risks phát hiện

| ID | Severity | Mô tả |
|----|----------|--------|
| P3-001 | **High** | `POST .../scene-graph/compile` → `path.resolve` undefined (circular `storage` import + default `path` import) |
| P3-002 | **High** | `next build` ENOENT `/_not-found` khi `.next` cache hỏng (dev + build song song) |
| P3-003 | **Medium** | `STORAGE_ROOT=./data` ghi vào `apps/api/data` thay vì repo `data/` |
| P3-004 | **Low** | UI không auto-refresh `savedPath` sau save (cần Refresh graph) |
| P3-005 | **Low** | Preview stickman simplistic — không phải rig GLB cuối |
| P3-006 | **Info** | `prebuild` xóa `.next` mỗi lần — build web chậm hơn, ổn định hơn |
| P3-007 | **Info** | Package lint stubs unchanged |
| P3-008 | **Info** | Phase 2 AI e2e vẫn không bắt buộc Ollama trong CI |

---

## 5. Lỗi đã sửa (trong Phase 3 + review)

| ID | Fix |
|----|-----|
| P3-001 | `project-paths.ts` bỏ import vòng; `scene-graph.service` dùng named `resolve`/`relative` |
| P3-002 | `app/not-found.tsx`, `prebuild` xóa `.next`, `transpilePackages` animation-engine |
| P3-003 | `resolveDataRoot()` — map `apps/api` + `./data` → repo `data/` |
| (review) | E2E `POST .../scene-graph/compile` + live curl verified |

---

## 6. Kết quả từng loại test

### Lint

`pnpm lint` — **PASS** (15 tasks; API eslint + `next lint` clean)

### Typecheck

`pnpm typecheck` — **PASS** (17/17, 2026-11-24)

### Unit tests

| Package | Result |
|---------|--------|
| `animation-engine` | **PASS** — 1 test |
| `ai-engine` | **PASS** — 3 tests (Phase 2 regression) |
| `api` unit | **PASS** — 2 tests |

### Integration / E2E

`pnpm --filter @ai-video-studio/api test:e2e` — **PASS** — **12** tests (thêm GET scene-graph, POST compile writes JSON)

### API live (`127.0.0.1:3001`)

| Flow | Result |
|------|--------|
| `GET /v1/system/info` | **PASS** `phase: 3` |
| `GET /v1/projects/:id/scene-graph` | **PASS** |
| `POST /v1/projects/f2f58c2e-.../scene-graph/compile` | **PASS** — HTTP 201, `savedPath`: `projects/.../scene-graph.v1.json` |
| Phase 0/1/2 regression (health, CRUD, e2e AI 400) | **PASS** (via e2e suite) |

### UI (browser, `localhost:3000`)

| Case | Result |
|------|--------|
| Project detail `f2f58c2e-...` | **PASS** — storyboard, script panel, **3D scene graph** section |
| Scene tabs + Refresh / Save graph buttons | **PASS** (enabled when scenes exist) |
| Three.js canvas | **PASS** — preview loads (snapshot shows scene selector) |

### Build

`pnpm build` — **PASS** (11/11 packages, 2026-11-24)

---

## 7. Build result

`pnpm build` — **PASS** — Turbo 11/11; Next.js routes include `/not-found`, project page bundle includes R3F chunk.

---

## 8. Acceptance criteria (Phase 3 scope)

| # | Criterion | Result |
|---|-----------|--------|
| AC-1 | `buildSceneGraph` + preset normalization | **PASS** |
| AC-2 | Zod `sceneGraphDocumentSchema` | **PASS** |
| AC-3 | GET compile API | **PASS** |
| AC-4 | POST persist to `data/projects/` | **PASS** (e2e + live curl) |
| AC-5 | Web preview panel | **PASS** (browser) |
| AC-6 | Phase 1/2 không regress | **PASS** (e2e 12/12, build) |
| AC-7 | Docs | **PASS** |
| AC-8 | Automated unit/e2e | **PASS** |

---

## 9. Vấn đề còn tồn tại

1. **TTS / audio** — Phase 4 (`audio-engine`, Python service).
2. **Remotion render** — Phase 5.
3. **BullMQ / Redis** — Phase 6 worker.
4. Preview 3D là proxy geometry — rig chuyên nghiệp sau.
5. UI refresh sau save graph — thủ công hoặc invalidate query (minor).
6. E2E không assert file exists on disk (chỉ `savedPath` string).

---

## 10. Đánh giá chuyển Phase tiếp theo

| Verdict | **GO** → **Phase 4** (local TTS) |
|---------|----------------------------------|
| Rationale | Scene graph compile + persist + UI preview **verified live**; critical save bug **fixed**; build/tests **PASS**. |

---

## 11. Checklist tái kiểm tra

```powershell
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm --filter @ai-video-studio/animation-engine test
pnpm --filter @ai-video-studio/api test:e2e
# API + web dev; project with scenes → Save graph to data/
# Verify file: data\projects\<uuid>\scene-graph.v1.json
```

Chi tiết: [docs/TESTING.md](../TESTING.md), [STICKMAN_3D.md](../STICKMAN_3D.md)