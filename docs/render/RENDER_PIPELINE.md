# Render pipeline (Phase 5–6)

## Sync (default)

`POST /v1/projects/:id/render` with `{ locale, quality? }` — blocks until MP4 is written.

## Async (Phase 6.7)

`POST /v1/projects/:id/render` with `{ locale, async: true, quality? }` → `{ jobId, status: "queued" }`.

- Queue: `ai-video-studio-render` (BullMQ + Redis)
- Worker: `pnpm --filter @ai-video-studio/worker dev` (calls API sync render)
- Progress: `GET /v1/render/jobs/:jobId`

## Quality modes

| Mode | Resolution | Bitrate |
|------|------------|---------|
| preview | 1280×720 | 2M |
| standard | 1920×1080 | 4M |
| high | 1920×1080 | 8M |

## Assets

- Audio: HTTP scene WAV
- Hero GLB: HTTP `/v1/assets/stickman-hero.glb` + Remotion `publicDir` = `data/assets`
- Environment GLB: HTTP `/v1/assets/environments/{environmentId}.glb` (optional per scene)
- Subtitles: burned in Remotion overlay when `subtitleText` is set on clip

See also [RENDER.md](../RENDER.md).