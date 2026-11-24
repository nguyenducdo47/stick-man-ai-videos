# Testing

## Commands

| Command | Scope |
|---------|--------|
| `pnpm lint` | Turbo lint (API + web real ESLint; packages mostly stub) |
| `pnpm typecheck` | All packages with typecheck script |
| `pnpm test` | Turbo test (API unit when configured) |
| `pnpm --filter @ai-video-studio/api test` | API unit tests |
| `pnpm --filter @ai-video-studio/api test:e2e` | API integration (requires PostgreSQL + `.env`) |
| `pnpm build` | Full monorepo production build |

## Phase 1 manual checklist

- [ ] PostgreSQL running; `pnpm db:deploy` applied
- [ ] `pnpm db:seed` (local user)
- [ ] API `start:dev` on `127.0.0.1:3001`
- [ ] Web `dev` on `http://localhost:3000`
- [ ] Dashboard lists projects
- [ ] Create project form → detail page
- [ ] Storyboard editor: save scene fields + VI/EN narration; delete scene
- [ ] Script draft save on project page
- [ ] Dashboard stats cards (`/v1/dashboard/stats`)
- [ ] `GET /v1/system/db` → `{ connected: true }`

See [PHASE_1_TEST_REPORT.md](./result_testing/PHASE_1_TEST_REPORT.md), [PHASE_2_TEST_REPORT.md](./result_testing/PHASE_2_TEST_REPORT.md), and [PHASE_3_TEST_REPORT.md](./result_testing/PHASE_3_TEST_REPORT.md) for latest runs.

## Phase 2 manual checklist

- [ ] Ollama running; `qwen3:4b` installed (`GET /v1/ollama/status` → `defaultModelAvailable: true`)
- [ ] API + web dev servers restarted after `pnpm build` if UI shows chunk errors
- [ ] `/settings/ai` shows reachable + models
- [ ] Create project with clear **topic**, duration, scene count
- [ ] **Generate script** — wait 1–10+ min on slow CPU; script shows Scene 1…
- [ ] **Generate storyboard** — scenes appear with VI/EN narration
- [ ] Phase 1 still works: dashboard stats, scene editor, PATCH script save
- [ ] `pnpm --filter @ai-video-studio/ai-engine test`

## Phase 3 manual checklist

- [ ] Project with storyboard scenes (manual or AI)
- [ ] `GET /v1/projects/:id/scene-graph` returns `graph.version === 1`
- [ ] UI: **3D scene graph** panel on project page — preview + scene tabs
- [ ] **Save graph to data/** → file under `data/projects/<uuid>/scene-graph.v1.json`
- [ ] `pnpm --filter @ai-video-studio/animation-engine test`

## Phase 4 manual checklist

- [ ] `services/local-tts`: `start-tts.bat` (port **5001**); `GET /health` → `engine: korva`
- [ ] API `start:dev` on `3001`; `.env` `TTS_SERVICE_URL=http://127.0.0.1:5001`
- [ ] `/settings/tts` — reachable, voice dropdown, **Nghe thử**, **Lưu giọng**
- [ ] `GET /v1/tts/status` → `korvaVoiceVi` matches `data/studio/tts-preferences.v1.json`
- [ ] Project: narration VI → **Generate TTS (vi)** → player plays new clip (cache-bust `?v=`)
- [ ] `data/audio/projects/.../vi.wav` exists on disk
- [ ] Phase 1–3 still OK: scene graph compile, Ollama status (no regression)
- [ ] Optional: `POST /v1/tts/preview` returns WAV bytes

See [PHASE_4_TEST_REPORT.md](./result_testing/PHASE_4_TEST_REPORT.md).