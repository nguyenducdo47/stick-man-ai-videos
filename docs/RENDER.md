# Phase 5 — Remotion export

Exports one **MP4 per locale** from the compiled stickman scene graph and per-scene narration WAV files.

## Prerequisites

- **FFmpeg** on `PATH` or `FFMPEG_PATH` in `.env` (same as Laragon FFmpeg binary path on Windows).
- Scene graph compiles (`GET /v1/projects/:id/scene-graph`).
- **TTS** WAV for every scene in the target locale (`data/audio/projects/<project>/scenes/<scene>/<locale>.wav`).

## Output

```
data/renders/projects/<projectPublicId>/<locale>.mp4
```

Metadata is stored in PostgreSQL (`ProjectRender`, one row per project + locale).

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/render/status` | FFmpeg probe + Remotion entry path |
| GET | `/v1/projects/:id/renders` | List render records |
| POST | `/v1/projects/:id/render` | Body `{ "locale": "vi" \| "en" }` — sync render (concurrency **1**) |
| GET | `/v1/projects/:id/video/:locale` | Stream MP4 |

## Implementation

- **`packages/video-engine`**: Remotion `ProjectVideo` — per scene: **Three.js stickman** (presets `walk` / `wave` / …), **grid + floor**, camera from scene graph, title overlay, `Audio` via `http://127.0.0.1:3001/v1/scenes/.../audio/...`.
- API must stay up while rendering so Chromium can download WAV clips.
- **Cache**: first render bundles to `data/studio/remotion-bundle/` (reused in-process).
- **Timing**: scene length = `max(sceneGraph.durationSec, wavDuration, 0.5s)` — deterministic, no random.

## Web

Project page → **Export video** → render per language, inline `<video>` player with cache-busted URL.

## Phase 6+

BullMQ worker (`apps/worker`) will move long renders off the API process; Phase 5 keeps the same HTTP contract synchronously.