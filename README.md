# AI Video Studio

Local-first AI video production studio for Windows: Ollama scripts, shared 3D stickman scenes, dual-language (Vietnamese / English) narration and exports.

## Status

| Phase | Scope | Status |
|-------|--------|--------|
| 0 | Monorepo, Docker/Laragon docs, health + Ollama probe | Done |
| 1 | PostgreSQL, project/scene CRUD, dashboard, storyboard editor, shadcn | Done — [PHASE_1_TEST_REPORT](./docs/result_testing/PHASE_1_TEST_REPORT.md) |
| 2 | Ollama AI Director (script + storyboard), `AiGeneration` audit | Done — [PHASE_2_TEST_REPORT](./docs/result_testing/PHASE_2_TEST_REPORT.md) |
| 3 | Stickman scene graph compile, `data/` JSON, Three.js preview | Done — [PHASE_3_TEST_REPORT](./docs/result_testing/PHASE_3_TEST_REPORT.md) |
| 4 | Local TTS (`audio-engine`, Python service), narration WAV in `data/audio/` | Done — [PHASE_4_TEST_REPORT](./docs/result_testing/PHASE_4_TEST_REPORT.md) |
| 5 | Remotion MP4 export per locale (`video-engine`, FFmpeg) | Done — [RENDER.md](./docs/RENDER.md), [PHASE_5_TEST_REPORT](./docs/result_testing/PHASE_5_TEST_REPORT.md) |
| 6 | Animation v2, environments, timeline, BullMQ render | [PHASE_6_TEST_REPORT](./docs/result_testing/PHASE_6_TEST_REPORT.md) |

## Prerequisites

- Node.js 20+ (detected: Laragon Node 22)
- pnpm 9+ (`corepack prepare pnpm@9.15.0 --activate`)
- Python 3.10+ (TTS service, Phase 4)
- PostgreSQL + Redis (Docker **or** Laragon)
- Ollama with `qwen3:4b` (and optional `qwen3:1.7b` fallback)
- FFmpeg (Phase 5)

See [docs/LOCAL_SETUP.md](./docs/LOCAL_SETUP.md) and [docs/OLLAMA_SETUP.md](./docs/OLLAMA_SETUP.md).

## Quick start (Windows)

```powershell
cd C:\laragon\www\stick-man-ai-videos
.\scripts\check-env.ps1
pnpm install
pnpm build
```

Terminal A — API:

```powershell
pnpm --filter @ai-video-studio/api start:dev
```

Terminal B — Web:

```powershell
pnpm --filter @ai-video-studio/web dev
```

Terminal C — Local TTS (Phase 4):

```powershell
cd services\local-tts
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 5001
```

- Web: http://localhost:3000  
- API health: http://127.0.0.1:3001/health  
- Ollama status: http://127.0.0.1:3001/v1/ollama/status  

Copy `.env.example` to `.env` and start PostgreSQL/Redis before Phase 1.

## Repository layout

```
apps/web          Next.js studio UI
apps/api          NestJS REST API
apps/worker       BullMQ worker (stub)
packages/*        shared, validation, database, ai-engine, …
services/local-tts Python TTS (Phase 4)
```

## License

Choose a license before commercial distribution. Verify third-party model and asset licenses.