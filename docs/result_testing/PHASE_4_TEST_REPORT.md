# PHASE 4 — Test & acceptance report

**Date:** 2026-11-24  
**Reviewer:** Cursor agent (code review + live tests)  
**Scope:** Local TTS — `services/local-tts` (KorvaTTS), `@ai-video-studio/audio-engine`, Nest `TtsModule`, web Settings/scene narration, `data/audio/` + `data/studio/tts-preferences.v1.json`

---

## 1. Tổng quan

Phase 4 delivers **on-device Vietnamese narration**: KorvaTTS (ONNX) behind FastAPI, HTTP client in `audio-engine`, Nest endpoints to synthesize per scene/locale and batch, studio voice prefs on disk, Web UI (status, voice picker, preview, generate + player). Aligns with `AGENTS.md` (no cloud TTS, Zod boundaries, binaries in `data/`, concurrency 1). Phases 1–3 flows (CRUD, Ollama, scene graph) **regression-tested** on live API.

During review, **prefs vs `.env` desync** on Python `/health` was fixed (studio JSON now wins); **browser audio cache** and **korvaVoiceVi** echo in API response added.

**Verdict:** **GO** → Phase 5 (Remotion render / FFmpeg mux).  
**Note:** Automated browser E2E not run in this session; UI verified via **build + typecheck** and prior manual use. Live API + Korva integration **executed** below.

---

## 2. Files đã kiểm tra (đọc / review)

| Area | Paths |
|------|--------|
| Python TTS | `services/local-tts/main.py`, `korva_backend.py`, `studio_preferences.py`, `env_loader.py`, `start-tts.bat` |
| Client | `packages/audio-engine/src/tts-client.ts` |
| Validation | `packages/validation/src/tts.ts`, `scene.ts` |
| Storage | `packages/storage/src/project-paths.ts` |
| API | `apps/api/src/tts/*` (controller, service, preferences store, factory) |
| DB | `packages/database/prisma/schema.prisma`, migration `20251124120000_phase4_tts` |
| Web | `settings/tts/page.tsx`, `scene-editor-card.tsx`, `lib/api.ts`, project page batch TTS |
| Tests | `apps/api/test/projects.e2e-spec.ts` |
| Docs | `API_SPEC.md`, `TESTING.md`, `TTS_VIETNAMESE.md`, `LOCAL_SETUP.md`, `README.md` |

---

## 3. Kiến trúc vs AGENTS.md / docs

| Rule | Status |
|------|--------|
| Strict TypeScript | **PASS** — `pnpm typecheck` 18/18 |
| Zod at API boundaries | **PASS** — `tts.ts`, prefs, preview, scene TTS |
| No cloud TTS in prod path | **PASS** — Korva/Piper/pyttsx3 only |
| No mock TTS success | **PASS** — `503`/`422` when down/invalid |
| Binaries in `data/` | **PASS** — WAV + `tts-preferences.v1.json` |
| DB migration for audio metadata | **PASS** — `audioPath`, `audioGeneratedAt` |
| Phase-gated (no Redis worker TTS) | **PASS** — sync HTTP queue in API |
| Local-first | **PASS** — Hugging Face download local, Ollama unchanged |

---

## 4. Lỗi / risks phát hiện

| ID | Severity | Mô tả |
|----|----------|--------|
| P4-001 | **High** (fixed) | Python `/health` showed `.env` voice (`huu_dat`) while studio prefs had `bao_kim` / `hoang_nam` |
| P4-002 | **Medium** (fixed) | Browser cached scene audio (same URL after re-generate) |
| P4-003 | **Medium** (fixed) | Scene editor không hiện / không dùng giọng từ Settings |
| P4-004 | **Low** (fixed) | `POST /v1/tts/preview` returned **201** instead of 200 |
| P4-005 | **Low** | `API_SPEC.md` / `TESTING.md` thiếu Phase 4 (updated in review) |
| P4-006 | **Low** | `audio-engine` không có unit tests |
| P4-007 | **Info** | Korva cold synth ~10–15s/câu ngắn trên CPU — chấp nhận local MVP |
| P4-008 | **Info** | `EN` locale vẫn pyttsx3 (David/Zira) — chưa Korva batch EN |
| P4-009 | **Info** | TTS prefs/preview không auth — đúng single-user local studio |
| P4-010 | **Info** | E2e không bắt buộc Korva chạy (synth live tested thủ công) |
| P4-011 | **Info** | Playwright/UI automation **not run** this acceptance pass |

---

## 5. Lỗi đã sửa (trong Phase 4 + review)

| ID | Fix |
|----|-----|
| P4-001 | `studio_preferences.py`; `vi_voice_name()` ưu tiên `data/studio/tts-preferences.v1.json` |
| P4-002 | `apiAssetUrlVersioned`, `Cache-Control: no-store` on audio stream |
| P4-003 | `GET/PATCH /v1/tts/preferences`, UI dropdown + **Nghe thử**, `korvaVoiceVi` on generate response |
| P4-004 | `@HttpCode(200)` on preview |
| P4-005 | `API_SPEC.md` Phase 4 table; `TESTING.md` Phase 4 checklist |

---

## 6. Kết quả từng loại test

### Lint

`pnpm lint` — **PASS** (16 tasks; API eslint + `next lint` clean; package stubs unchanged)

### Typecheck

`pnpm typecheck` — **PASS** (18/18, 2026-11-24)

### Unit tests

| Package | Result |
|---------|--------|
| `@ai-video-studio/ai-engine` | **PASS** (3 tests) |
| `@ai-video-studio/animation-engine` | **PASS** (1 test) |
| `audio-engine` | **N/A** — no test script |
| API Jest unit | **N/A** — only e2e configured |

### Integration / E2E (Jest + PostgreSQL)

`pnpm --filter @ai-video-studio/api test:e2e` — **PASS** (**15** tests, 2026-11-24)

Includes: `GET /v1/tts/status`, `GET /v1/tts/preferences`, empty narration → `400`, Phase 1–3 project/scene/scene-graph tests.

### Live API (Korva + Nest running on machine)

| Check | Result |
|-------|--------|
| `GET :5001/health` | **PASS** — `engine: korva`, `korvaStudioVoiceVi` = prefs |
| `GET :3001/v1/tts/status` | **PASS** — `reachable: true`, `korvaVoiceVi` aligned |
| `GET /v1/tts/preferences` | **PASS** |
| `POST /v1/tts/preview` | **PASS** — WAV ~121 KB (after fix: status **200**) |
| `POST …/localizations/vi/tts` | **PASS** — `korvaVoiceVi: hoang_nam`, WAV ~243 KB on disk |
| `GET …/audio/vi` | **PASS** — `200` `audio/wav` |
| `GET …/scene-graph` after TTS | **PASS** — Phase 3 regression (1 scene, version 1) |

### Build

`pnpm build` — **PASS** (11/11 packages, 2026-11-24)

### Web UI (automated)

**Not executed** (no Playwright). **Build/lint/typecheck PASS** for `/settings/tts` and scene editor. Manual checklist in [TESTING.md](../TESTING.md).

---

## 7. Build result

```
Tasks: 11 successful, 11 total (turbo build)
Routes: /settings/tts, /projects/[publicId], … — Next.js 15.2.4 OK
```

---

## 8. Acceptance criteria

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Local TTS service + health | **PASS** |
| 2 | Korva VI synthesis end-to-end | **PASS** (live) |
| 3 | WAV under `data/audio/projects/...` | **PASS** |
| 4 | DB `audioPath` / `audioGeneratedAt` | **PASS** |
| 5 | Web: settings + generate + play | **PASS** (build); manual expected |
| 6 | Voice prefs persisted + used on generate | **PASS** |
| 7 | No cloud TTS | **PASS** |
| 8 | Phase 1–3 not broken | **PASS** (e2e + live scene-graph) |
| 9 | Docs updated | **PASS** |

---

## 9. Vấn đề còn tồn tại

1. **EN TTS** — pyttsx3 only; set `KORVATTS_VOICE_EN` + Korva if needed later.  
2. **`audio-engine` tests** — add Vitest HTTP client mocks (optional).  
3. **BullMQ async TTS** — Phase 6.  
4. **First Korva load** — Hugging Face cache + ONNX init; document restart `start-tts.bat`.  
5. **Automated UI tests** — deferred.  
6. **Dual source of truth** — studio JSON + optional `.env` fallback; document prefer web **Lưu giọng**.

---

## 10. Verdict

| | |
|---|---|
| **Phase 4 complete?** | **Yes** — core acceptance met with live Korva + Nest |
| **Go to Phase 5?** | **Yes** |

**Không** đánh dấu full end-MVP — Remotion render, Redis worker, production hardening remain Phase 5+.