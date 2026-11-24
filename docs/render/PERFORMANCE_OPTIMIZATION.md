# Render performance (Phase 6.7)

## Modes

| Mode | Resolution | Bitrate | Use |
|------|------------|---------|-----|
| `preview` | 960×540 | 1.5M | Quick iteration |
| `standard` | 1920×1080 | 4M | Default export |
| `high` / `hq` | 1920×1080 | 8–10M | Final delivery |

## Local tips (RTX 4050 / 16GB)

- Run **async render** via Redis + worker; keep API responsive.
- Set `RENDER_MIN_FREE_MB=1500` in `.env` (default) — blocks render when RAM is low.
- Close other GPU-heavy apps during HQ exports.
- First render bundles Remotion (`data/studio/remotion-bundle/`); later jobs reuse cache.
- Optional: set `FFMPEG_PATH` to Laragon ffmpeg for predictable ffprobe validation.

## Bottleneck order

1. Remotion bundle (first run)
2. Per-frame Three.js scene render
3. JPEG encode + H.264 mux