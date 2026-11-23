# Agent guide — AI Video Studio

## Read first

1. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
2. [docs/LOCAL_SETUP.md](./docs/LOCAL_SETUP.md)
3. Phase plan in README — implement one phase at a time; verify builds before the next phase.

## Rules

- Strict TypeScript; Zod for API boundaries.
- No cloud AI in production paths; Ollama + local TTS only.
- Mock providers are for tests only — never return mock LLM/TTS as success in real flows.
- Do not download large models without user confirmation.
- Keep binaries in `data/`, not PostgreSQL.

## Commands

```powershell
pnpm install
pnpm build
pnpm dev
pnpm --filter @ai-video-studio/api test
```

## Cursor rules

See `.cursor/rules/*.mdc` for frontend, backend, ai-engine, video-engine, and testing conventions.