# API spec

Base URL: `http://127.0.0.1:3001`

## Phase 0

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | API liveness (Zod-validated) |
| GET | `/v1/system/info` | Build phase metadata |
| GET | `/v1/system/db` | PostgreSQL connectivity check |
| GET | `/v1/dashboard/stats` | Project/scene counts and status breakdown |
| GET | `/v1/ollama/status` | Ollama reachability and models |

## Phase 1 — Projects & scenes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/projects` | List local user's projects |
| POST | `/v1/projects` | Create project (Zod body) |
| GET | `/v1/projects/:publicId` | Project detail |
| PATCH | `/v1/projects/:publicId` | Update project |
| DELETE | `/v1/projects/:publicId` | Delete project |
| GET | `/v1/projects/:publicId/scenes` | List scenes |
| POST | `/v1/projects/:publicId/scenes` | Create scene (+ locale rows) |
| DELETE | `/v1/scenes/:publicId` | Delete scene |
| PATCH | `/v1/scenes/:publicId` | Update scene |
| PATCH | `/v1/scenes/:publicId/localizations/:locale` | Upsert VI/EN narration |

All IDs in URLs are **UUID `publicId`**, not internal bigint keys.

## Phase 2 — AI Director (Ollama)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/projects/:publicId/ai/script` | Generate script via Ollama; saves `scriptDraft`, sets status `SCRIPTING` |
| POST | `/v1/projects/:publicId/ai/storyboard` | Generate scenes from `scriptDraft`; replaces all scenes; status `STORYBOARD` |

Optional JSON body: `{ "model"?: string, "temperature"?: 0–1 }`.

Responses:

- **Script:** `{ project, synopsis }`
- **Storyboard:** `{ project, scenes }`

Errors: `400` if storyboard requested without script; `503` if Ollama unreachable or model missing. Generation attempts are logged in `AiGeneration` (PostgreSQL).

See [AI_DIRECTOR.md](./AI_DIRECTOR.md).

## Phase 3 — Scene graph (3D)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/projects/:publicId/scene-graph` | Compile stickman graph (`?save=true` optional) |
| POST | `/v1/projects/:publicId/scene-graph/compile` | Compile + write `data/projects/<id>/scene-graph.v1.json` |

Response: `{ projectPublicId, graph, savedPath }` — `graph` validated by `sceneGraphDocumentSchema`.

See [STICKMAN_3D.md](./STICKMAN_3D.md).

## Phase 4 — Local TTS (Korva / Piper / SAPI)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/tts/status` | Probe `TTS_SERVICE_URL`; Korva voices + `korvaVoiceVi` from studio prefs |
| GET | `/v1/tts/preferences` | `{ korvaVoiceVi, korvaVoices? }` |
| PATCH | `/v1/tts/preferences` | Body `{ korvaVoiceVi }` → `data/studio/tts-preferences.v1.json` |
| POST | `/v1/tts/preview` | Body `{ korvaVoiceVi?, text? }` → `audio/wav` (200) |
| POST | `/v1/scenes/:publicId/localizations/:locale/tts` | Synthesize narration → WAV under `data/audio/` |
| POST | `/v1/projects/:publicId/tts` | Batch TTS for all scenes/locales |
| GET | `/v1/scenes/:publicId/audio/:locale` | Stream WAV (`Cache-Control: no-store`) |

Python service (default `http://127.0.0.1:5001`): `GET /health`, `POST /v1/synthesize` with optional `{ voice }`.

Errors: `400` empty narration; `503` TTS down; `422` missing VI voice (legacy SAPI path). No mock audio on failure.

See [TTS_VIETNAMESE.md](./TTS_VIETNAMESE.md), [services/local-tts/README.md](../services/local-tts/README.md).