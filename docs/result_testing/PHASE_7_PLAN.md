# Phase 7 — content, assets, hardening

**Goal:** Production-friendly asset onboarding, safer web preview, cancellable async renders, two new interior presets, and optional render smoke e2e.

## Milestones

| ID | Deliverable | Status |
|----|-------------|--------|
| 7.1 | `GET /v1/assets/status` + `HEAD` probes for hero/env GLB | Done |
| 7.2 | Web **Settings → Assets** onboarding UI | Done |
| 7.3 | Preview uses status API (no blind GLB 404) | Done |
| 7.4 | Async render **hard cancel** (`AbortSignal` → Remotion) | Done |
| 7.5 | Presets `bedroom`, `bathroom` (procedural + registry) | Done |
| 7.6 | Optional `RUN_RENDER_SMOKE=1` API e2e | Done |
| 7.7 | Playwright E2E (`pnpm test:e2e`) | Done |

## Ops

- Re-render after bundle bump `stickman-7-v1` for new environments in MP4.
- Install GLB: `node scripts/install-cc0-glb-assets.mjs --smoke-test` or manual copy.

**Acceptance:** [PHASE_7_TEST_REPORT.md](./PHASE_7_TEST_REPORT.md)

## Next (Phase 8+ ideas)

- Asset upload API, real CC0 art packs, TTS/render job dashboard, deeper Playwright flows (project CRUD).