# AI Director (Phase 2)

Local script and storyboard generation using **Ollama** and structured JSON (Zod).

## Flow

1. **Script** — `AiDirector.generateScript` → validates `aiScriptOutputSchema` → updates `Project.scriptDraft`.
2. **Storyboard** — reads `scriptDraft` → `generateStoryboard` → replaces `Scene` rows and VI/EN `SceneLocalization` narration.

## Packages

- `packages/ai-engine` — `OllamaProvider`, `AiDirector`, `generateStructuredOutput`, `extractJsonText`
- `packages/validation` — `aiScriptOutputSchema`, `aiStoryboardOutputSchema`, `aiGenerateOptionsSchema`

## API

- `POST /v1/projects/:publicId/ai/script`
- `POST /v1/projects/:publicId/ai/storyboard`

The API queues generations **one at a time** (in-process) to avoid overloading Ollama on single-GPU machines.

## Prerequisites

1. Ollama running (`OLLAMA_BASE_URL`, default `http://127.0.0.1:11434`).
2. Model installed: `ollama pull qwen3:4b` (or set `OLLAMA_DEFAULT_MODEL`).

Check: `GET /v1/ollama/status` or **Studio → Ollama** (`/settings/ai`).

## UI

On the project page: **Generate script**, **Generate storyboard** (requires a script). Long runs may take several minutes; keep the API terminal open.

## Testing

- Unit: `pnpm --filter @ai-video-studio/ai-engine test` (JSON extraction).
- E2E: storyboard without script → `400`; full Ollama path is manual until CI has a model.