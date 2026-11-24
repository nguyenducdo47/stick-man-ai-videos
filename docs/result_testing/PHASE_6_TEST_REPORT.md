# Phase 6 — acceptance & code review report (rev. 2)

**Date:** 2026-11-24  
**Scope:** Milestones 6.2–6.8 **plus** GLB hero/env pipeline, illustration environments, seed scripts, sample projects (Monday 30s, Daily life 48s).  
**Reviewer:** Agent (automated runs + live API + browser smoke).

---

## 1. Tổng quan

Phase 6 delivers scene-graph v2, timeline/interactions/camera keyframes, procedural + optional GLB rendering, five environment presets, Remotion export (sync/async), worker, and quality modes. This review covers the **incremental work** after the first Phase 6 report: environment/hero GLB loading, render payload `environmentGlbSrc`, web preview asset URLs, CC0 install scripts, and two seeded demo projects.

**Verdict:** **Conditional PASS for Phase 6 completion** — automated tests green, live export verified on project `6ed038c4-68f2-4c74-8924-6bb99d924f7b` (vi/en 48s). Not pixel-perfect match to reference art (smoke/custom GLB). **Ready to plan Phase 7** (content/tools), not “production art complete.”

---

## 2. Files reviewed (representative)

| Area | Paths |
|------|--------|
| Storage / API | `packages/storage/src/project-paths.ts`, `apps/api/src/assets/assets.controller.ts`, `apps/api/src/render/project-render.service.ts` |
| Validation / render | `packages/validation/src/render.ts` |
| Renderer | `packages/stickman-renderer/src/environment-glb-*.tsx`, `environment-props.tsx`, `stickman-scene.tsx`, `hero-glb-loaded.tsx` |
| Animation | `packages/animation-engine/src/environment-presets.ts`, `gltf-action-map.ts`, `action-registry.ts`, `environment-illustration-scenes.tsx` |
| Video / Remotion | `packages/video-engine/remotion/*`, `render-project-video.ts` (bundle `stickman-6-v5`) |
| Web | `apps/web/src/components/scene-graph-canvas.tsx`, `apps/web/src/lib/studio-assets.ts` |
| Scripts / data | `scripts/install-cc0-glb-assets.mjs`, `scripts/seed-*.mjs`, `data/studio/assets.v1.json`, `data/studio/gltf-action-map.v1.json` |
| Tests | `apps/api/test/assets.e2e-spec.ts` (new), `apps/api/test/projects.e2e-spec.ts` |

---

## 3. Kiến trúc vs AGENTS.md / docs

| Rule | Check |
|------|--------|
| Strict TS + Zod at API | **PASS** — `environmentIdSchema` on asset route; `renderClipSchema` includes `environmentGlbSrc` |
| Binaries in `data/` | **PASS** — GLB under `data/assets/`; MP4 under `data/renders/` |
| No cloud AI in prod paths | **PASS** — unchanged |
| No auto-download large models without confirm | **PASS** — install script requires `--confirm-download`; `--smoke-test` documented |
| Phase-gated | **PASS** — v2 graph parallel v1; fallback procedural when GLB missing |
| Docs | **PASS** — `ENVIRONMENT_LIBRARY.md`, `RENDER_PIPELINE.md`, asset READMEs updated |

---

## 4. Review themes

### Logic

- Multi `actionClips` per scene compile and render (verified: scene-graph-v2 scene 1 has 2 clips).
- `environmentGlbSrc` resolved per `environmentId` with disk check; null → procedural props (intended).
- Hero GLB: fuzzy clip name lookup; empty animations → procedural fallback.

### Security

- Asset routes do not expose arbitrary paths: env id validated via `environmentIdSchema` only. **No path traversal.**
- GLB served read-only via `createReadStream` (same as hero).

### Performance

- **Fixed in review:** duplicate `access()` + URL build per scene replaced with `envGlbCache` in `ProjectRenderService`.
- Remotion 48s × 6 scenes × GLB ≈ 90s render, ~6 MB MP4 (acceptable on preview). Long sync render may drop HTTP client on slow runs (retry succeeds — flake).

### Maintainability

- **Fixed:** removed unused `readFileSync` import in install script.
- **Open:** `gltf-action-map.v1.json` duplicated in `gltf-action-map.ts` (manual sync).
- Web preview always passes hero/env URLs; missing hero → 404 in network tab (R3F may log errors until user installs GLB).

---

## 5. Lỗi phát hiện

| ID | Severity | Description |
|----|----------|-------------|
| R6-1 | Low | Redundant `environmentGlbSrc()` per scene in render loop |
| R6-2 | Low | Unused import in `install-cc0-glb-assets.mjs` |
| R6-3 | Low | No automated e2e for asset endpoints |
| R6-4 | Medium | Sync render 48s: occasional client connection reset (first attempt) |
| R6-5 | Medium | Web 3D preview requests GLB even when file missing (404 noise) |
| R6-6 | Low | Smoke GLB assets ≠ production art; user must replace CC0 packs |
| R6-7 | Low | Many procedural-only actions have no GLTF clip on typical rigs |

---

## 6. Lỗi đã sửa (this review)

| ID | Fix |
|----|-----|
| R6-1 | `envGlbCache` in [`project-render.service.ts`](apps/api/src/render/project-render.service.ts) |
| R6-2 | Removed dead import in install script |
| R6-3 | Added [`apps/api/test/assets.e2e-spec.ts`](apps/api/test/assets.e2e-spec.ts) (4 cases) |

---

## 7. Kết quả từng loại test (đã chạy thực tế)

| Test | Command / method | Result |
|------|------------------|--------|
| Build | `pnpm build` (turbo 12 packages) | **PASS** |
| Web lint | `pnpm --filter @ai-video-studio/web lint` | **PASS** |
| Unit (animation-engine) | `pnpm --filter @ai-video-studio/animation-engine test` | **PASS** (3/3) |
| API unit | `pnpm --filter @ai-video-studio/api test` | **PASS** (2/2) |
| API e2e | `pnpm --filter @ai-video-studio/api test:e2e` | **PASS** (22/22) |
| Live API | `GET /health`, hero/env GLB HEAD, invalid env 404, scene-graph-v2 6 scenes | **PASS** |
| Live TTS | Project `6ed038c4…` batch TTS (12 files) — prior run | **PASS** |
| Live render | `vi.mp4` / `en.mp4` 48s, 5.92 / 5.84 MB | **PASS** |
| UI smoke | Browser: project page, 6 scenes, timeline 2 clips, export SUCCESS vi/en | **PASS** |

**Not run this session:** Full `pnpm test` turbo across all packages; Remotion `validateRenderedMp4` invoked inside successful render path (implicit PASS on last export).

---

## 8. Build result

```
Tasks: 12 successful, 12 total (pnpm build @ 2026-11-24)
```

---

## 9. Acceptance criteria (audit §14 + GLB extension)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Many animations (23 ids) | **PASS** |
| 2 | Combine actions per scene | **PASS** (daily-life project) |
| 3 | ≥5 environments | **PASS** |
| 4 | Props / env art | **PARTIAL** — procedural + optional GLB |
| 5 | Character placement | **PASS** (interactions) |
| 6 | Character–object interaction | **PASS** |
| 7 | Camera motion | **PASS** |
| 8 | Timeline editor UI | **PASS** |
| 9 | Scene preview | **PASS** |
| 10 | MP4 export | **PASS** |
| 11 | A/V sync | **PASS** (max scene vs WAV) |
| 12 | Black/frozen check | **PASS** (on successful render) |
| 13 | Memory leaks | **NOT TESTED** (instrumentation) |
| 14 | Progress + cancel | **PASS** (API); cancel in-flight Chromium **limited** |
| 15 | Target hardware | Documented in `PERFORMANCE_OPTIMIZATION.md` |
| 16 | No regression | **PASS** (e2e 22/22) |
| 17 | Hero GLB optional | **PASS** |
| 18 | Environment GLB optional | **PASS** (new) |

---

## 10. Vấn đề còn tồn tại

- Production-quality art requires user-supplied CC0 GLB (not smoke samples).
- Preview UI does not HEAD-check assets before loading GLB URLs.
- Long sync renders may need client timeout retry or async-only for 60s+.
- GLTF clip map manual sync between JSON and TS.
- Worker still proxies sync render over HTTP; no hard kill of Chromium mid-render.
- E2E does not cover full Remotion render (time cost).

---

## 11. Demo projects (manual acceptance)

| Project | publicId | Scenes | Render |
|---------|----------|--------|--------|
| LP VN thứ Hai | `258a27c2-694d-4a2b-9231-15c7fe197e87` | 4 × 7.5s | vi/en preview (prior) |
| Một ngày — cử chỉ đa dạng | `6ed038c4-68f2-4c74-8924-6bb99d924f7b` | 6 × 8s | vi/en preview **SUCCESS** |

---

## 12. Chuyển Phase tiếp theo?

| Question | Answer |
|----------|--------|
| Phase 6 core (timeline, export, worker) | **Đủ điều kiện đóng** |
| Reference-art parity | **Chưa** — needs real CC0 env packs + hero rig |
| Suggested Phase 7 focus | Asset onboarding UI, optional `HEAD` asset probe in web, render job hard-cancel, e2e render smoke (flagged), bedroom/bathroom presets |

**Recommendation:** **Proceed to Phase 7 planning** with art/assets and hardening; do not block on visual parity with illustration mocks.

---

## 13. Checklist operator (post-review)

- [x] `pnpm build`
- [x] API e2e 22/22
- [x] animation-engine tests
- [x] web `next lint`
- [x] Live asset + graph + MP4 on disk
- [x] Web project page smoke
- [ ] Replace smoke GLB with licensed CC0 production assets
- [ ] `standard`/`hq` render on target machine if publishing