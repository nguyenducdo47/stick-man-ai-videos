# Architecture overview

## Monorepo

- **apps/web** — Next.js studio (dashboard, editors, settings).
- **apps/api** — NestJS REST, Prisma, job enqueue.
- **apps/worker** — BullMQ consumers for TTS and render.
- **packages/ai-engine** — Ollama + Mock LLM providers, AI Director (Phase 2).
- **packages/database** — Prisma schema and client.
- **packages/validation** — Zod schemas shared by API and web.
- **services/local-tts** — Kokoro/Piper FastAPI (Phase 4).

## Data flow (target MVP)

1. User creates a project (PostgreSQL).
2. AI Director calls Ollama → script + storyboard (validated JSON).
3. Scenes shared across locales; `SceneLocalization` holds VI/EN narration.
4. TTS writes audio under `data/audio/`.
5. Remotion + Three.js render per locale → `data/renders/`.

## Hardware defaults

- LLM, TTS, and render concurrency: **1** each on 16 GB RAM / 4 GB VRAM laptops.