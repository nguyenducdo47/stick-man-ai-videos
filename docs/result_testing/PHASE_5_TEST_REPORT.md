# Phase 5 — Test Report (Remotion export)

**Date:** 2025-11-24  
**Scope:** Sync MP4 render per locale, FFmpeg probe, `ProjectRender` metadata, Web export panel.

## Automated

| Check | Result |
|-------|--------|
| `pnpm build` (11 packages) | PASS |
| `pnpm --filter @ai-video-studio/api test:e2e` | **17/17** PASS (incl. `/v1/render/status`, render without audio) |
| Migration `20251124140000_phase5_render` | Applied |

## Manual (recommended)

1. Set `FFMPEG_PATH` in `.env` (Laragon FFmpeg) or ensure `ffmpeg` on PATH.
2. `GET /v1/render/status` → `ffmpegAvailable: true`.
3. Project with scenes + **Generate all TTS** (vi/en).
4. `POST /v1/projects/:id/render` `{ "locale": "vi" }` → MP4 under `data/renders/projects/<id>/vi.mp4`.
5. Web: **Export video** → player shows rendered file.
6. First render bundles Remotion (~1–2 min); subsequent locales faster (cached bundle).

## Verdict

**GO** → Phase 6 (BullMQ worker, async jobs).  
MVP composition is slide + narration per scene; richer stickman Remotion/Three integration can follow without API changes.