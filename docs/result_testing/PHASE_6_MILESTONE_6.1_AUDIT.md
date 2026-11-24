# Phase 6 — Milestone 6.1 Audit  
## Animation Engine & Render Pipeline

**Date:** 2026-11-24  
**Author:** Agent audit (pre-implementation)  
**Verdict:** **Foundation usable — not ready for Phase 6 acceptance criteria.** Proceed to 6.2 only after user confirms this plan.

---

## 1. Executive summary

Phases **1–5** deliver a working local studio: CRUD, Ollama script/storyboard, scene graph JSON, Korva TTS, and **sync Remotion MP4 export** with a **procedural box stickman** (not skeletal GLB), grid/floor, static camera presets, and narration audio.

Phase 6 requirements (24+ actions, environments, interactions, timeline editor, cinematic camera, render modes, BullMQ, quality validation) are **largely unbuilt**. The current pipeline is the correct **integration point** but must evolve via **versioned scene data** (`scene-graph.v2` / `sceneTimeline.v1`) rather than replacing working modules.

**Critical honesty:** The product does **not** have skeletal animation today. Motion is **transform-based procedural** (`sin` on group/bones). Claiming “rig + GLB” in export would be false until assets and runtime loaders exist.

---

## 2. Verification run (this audit)

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm build` (11 packages) | **PASS** | 2026-11-24 audit run |
| `pnpm --filter @ai-video-studio/api test:e2e` | **PASS 17/17** | No render E2E with real Remotion |
| `pnpm --filter @ai-video-studio/animation-engine test` | **PASS 1/1** | `build-scene-graph` only |
| Live `GET /v1/render/status` | **Not run** | API not reachable on `:3001` during audit |
| Live full MP4 render | **Not re-run** | Prior artifact: `data/renders/projects/2f6911bb-…/vi.mp4` on disk |
| Manual UI / video QA | **Not run** | Requires operator session |

**Status legend used below:**  
- **Implemented** — code exists  
- **Tested** — automated or documented manual pass  
- **Verified** — confirmed in this audit session on running app  

---

## 3. Phase 3–5 — actual state

### Phase 3 — Scene graph & preview

| Item | Status |
|------|--------|
| `buildSceneGraph()` → `sceneGraphDocumentSchema` v1 | Implemented, Tested |
| Web `SceneGraphCanvas` + `StickmanFigure` (R3F) | Implemented, Verified (code review) |
| `data/projects/<id>/scene-graph.v1.json` | Implemented |
| 3D rig / GLB | **Not implemented** (known since P3-005) |

**Scene graph v1 limits:**

- One `animationPreset` + one `cameraPreset` **per scene** for **entire** `durationSec`.
- `timeline` object stores ids only — **no keyed clips**, no blends, no interactions.

### Phase 4 — TTS

| Item | Status |
|------|--------|
| Korva local TTS, WAV in `data/audio/` | Implemented, Tested (PHASE_4 report) |
| Subtitles in DB (`SceneLocalization.subtitles`) | Field exists — **not burned into MP4** |

### Phase 5 — Remotion export

| Item | Status |
|------|--------|
| `ProjectRender` + `POST /v1/projects/:id/render` | Implemented, Tested (e2e partial) |
| Sync queue concurrency **1** in API | Implemented |
| `packages/video-engine` Remotion + Three (`stickman-3d-v1` bundle) | Implemented |
| Audio via HTTP (`/v1/scenes/:id/audio/:locale`) | Implemented (fixes `file://` block) |
| FFmpeg via `FFMPEG_PATH` or Remotion-bundled binary | Implemented |
| `apps/worker` BullMQ | **Placeholder only** |
| Render progress / cancel | **Not implemented** |
| Resolution / FPS modes | **Fixed 1920×1080 @ 30** |
| Subtitles in video | **Not implemented** |

---

## 4. Animation engine audit

**Location:** `packages/animation-engine/src/`

| Module | Responsibility |
|--------|----------------|
| `presets.ts` | 5 animation ids, 5 camera ids, static camera transforms |
| `build-scene-graph.ts` | DB scenes → graph v1 JSON |
| `index.ts` | Data layer export |

### 4.1 Animation presets (implemented)

`idle`, `walk`, `point`, `wave`, `sit` — metadata only (`armSwingDeg` etc. **not** consumed by renderer).

### 4.2 Phase 6 action list — gap

| Required (sample) | In codebase? |
|-------------------|--------------|
| run, jump, talk, explain, pick up, … (20+) | **No** |
| Multi-action per scene | **No** |
| State machine / blend | **No** |
| Foot sliding control | **No** |
| Multi-character | **No** |

### 4.3 Character model

| Approach | Status |
|----------|--------|
| Procedural primitives (boxes/spheres) | **Web + Remotion** (duplicated) |
| GLB + skeletal clips | **None** |
| IK / procedural bones | **None** |

**Files:**

- Web: `apps/web/src/components/stickman-figure.tsx`
- Export: `packages/video-engine/remotion/stickman-figure.tsx`  
→ **Drift risk** until shared package (e.g. `packages/stickman-renderer`).

### 4.4 Determinism (Remotion rule)

| Path | Time source |
|------|-------------|
| Web preview | `useFrame` + `clock.elapsedTime` — fine for editor |
| Remotion export | `useCurrentFrame() / fps` — **correct** |

---

## 5. Environment & assets audit

| Requirement | Status |
|-------------|--------|
| Environment presets (living room, street, park, …) | **None** |
| Props (furniture, cars, trees, …) | **None** |
| Asset catalog + license metadata | **None** |
| `data/assets/` or similar registry | **None** |
| Scene `config` Json column | Exists in Prisma — **unused** for env |

**Current “environment” in render:** `#09090b` background, `gridHelper`, single dark plane, fog.

---

## 6. Interaction & timeline audit

| Requirement | Status |
|-------------|--------|
| Target position, interaction points, attachments | **None** |
| Data-driven action sequences | **None** |
| Timeline UI (tracks, clips, drag) | **None** |
| Scene preview over full duration with multiple actions | **None** |

**AI Director** (`packages/ai-engine/src/ai-director.ts`):

- Outputs free-text `animationPreset` / `cameraPreset` strings.
- Zod allows any string ≤100 chars — **not** enum-restricted to registry.
- Unknown presets → `idle` / `wide-shot` at compile time.
- **No** environment, objects, or action list in schema.

---

## 7. Camera system audit

| Feature | Web preview | Remotion export |
|---------|-------------|-----------------|
| Preset positions (`CAMERA_PRESETS`) | Yes (static) | Yes (static) |
| OrbitControls | Yes | **No** |
| Follow / pan / zoom over time | **No** | **No** |
| Keyframes | **No** | **No** |

---

## 8. Render pipeline audit

**Flow today:**

```
PostgreSQL scenes + WAV
  → compile scene graph v1
  → build RenderClip[] (one preset / scene, audioSrc HTTP)
  → renderProjectVideo(): bundle Remotion (cached) → renderMedia h264
  → data/renders/projects/<id>/<locale>.mp4
  → ProjectRender row
```

### 8.1 Bottlenecks & risks (RTX 4050 4GB, 16GB RAM)

| ID | Severity | Issue |
|----|----------|--------|
| R6-001 | **High** | **Sync render in API process** — blocks HTTP; no progress/cancel; UI waits on one request |
| R6-002 | **High** | **Remotion + Three per frame** — CPU/RAM heavy; first bundle + render minutes long |
| R6-003 | **Medium** | **In-memory `serveUrlCache`** — stale bundle until API restart / revision bump |
| R6-004 | **Medium** | **API must stay up** during render for audio HTTP fetch |
| R6-005 | **Medium** | **Duplicated stickman** web vs video-engine |
| R6-006 | **Low** | Shadows enabled on stickman scene — cost on laptop GPU |
| R6-007 | **Low** | No subtitle/compositing layer |
| R6-008 | **Info** | `apps/worker` not consuming jobs — ARCHITECTURE.md still says BullMQ “target” |

### 8.2 Phase 6 render requirements — gap

| Requirement | Status |
|-------------|--------|
| Preview / Standard / HQ modes | **No** |
| 1080×1920, 720p, 60fps options | **No** |
| Memory pre-check / warnings | **No** |
| Render progress & cancel | **No** |
| Quality validation (black frame, A/V sync tests) | **No** |
| Benchmark suite + reports | **No** |

---

## 9. UI/UX audit

| Panel (Phase 6 target) | Status |
|------------------------|--------|
| Storyboard / scene editor | **Yes** (Phase 1) |
| Scene graph 3D preview (per-scene tabs) | **Yes** (Phase 3) |
| Export video | **Yes** (Phase 5) |
| Timeline editor | **No** |
| Environment / animation library | **No** |
| Render queue / settings | **No** |
| Professional editor layout | **No** |

---

## 10. Documentation gap (Phase 6 spec)

Requested paths — **not present yet:**

- `docs/animation/ANIMATION_SYSTEM.md`
- `docs/animation/CHARACTER_ACTION_LIBRARY.md`
- `docs/animation/ENVIRONMENT_LIBRARY.md`
- `docs/render/RENDER_PIPELINE.md` (partial overlap with `docs/RENDER.md`)
- `docs/render/PERFORMANCE_OPTIMIZATION.md`
- `docs/result_testing/PHASE_6_TEST_REPORT.md` (full acceptance — **after** milestones)

Existing: `docs/RENDER.md`, `docs/STICKMAN_3D.md` (updated for 3D export, still high-level).

---

## 11. What works well (do not rewrite)

- Monorepo boundaries, Zod API validation, `data/` binaries pattern.
- Scene graph compile + persist JSON.
- TTS pipeline and render **HTTP audio** contract.
- `resolveDataRoot`, project ownership, e2e regression suite.
- Procedural stickman as **placeholder character** until licensed GLB is chosen.

---

## 12. Recommended architecture for Phase 6

### 12.1 Data model (incremental)

1. **`scene-graph.v2` or `sceneTimeline.v1`** (Zod, version field):
   - `environmentId`, `objects[]`, `characters[]`, `clips[]` (actionId, startSec, duration, target, blend).
2. Keep **v1 compile** for backward compatibility; migrate via compile step.
3. Store editor state in `Scene.config` or new `data/projects/<id>/timelines/<sceneId>.json`.
4. **Asset registry** JSON under `data/studio/assets.v1.json` (id, path, license, poly count).

### 12.2 Animation strategy (honest options)

| Track | Pros | Cons | Recommendation |
|-------|------|------|----------------|
| **A. GLB + clips** (Mixamo/CC0) | Real skeletal motion | VRAM, licensing, loader complexity | **Medium term** — one hero stickman |
| **B. Procedural + state machine** | Lightweight, deterministic | Foot slide, limited fidelity | **6.2** on current mesh |
| **C. Hybrid** | Clips for walk/run, procedural for props | Engineering cost | **Target end state** |

Do **not** fake skeletal in UI if Track B is active — label “procedural stickman v1”.

### 12.3 Shared rendering

- Extract `StickmanFigure`, lighting, env shell → `packages/stickman-scene` (or extend `animation-engine` with React optional peer).
- Web preview and Remotion import **same module** → one motion implementation.

### 12.4 Render execution

- **6.7:** Move long renders to `apps/worker` (BullMQ), job status table, SSE or poll for progress, cancel token.
- Keep sync path as “quick export” optional.

---

## 13. Milestone implementation plan (6.2 → 6.8)

### 6.2 — Character action system

- Formal **action registry** (ids, labels, implementation: procedural | clip).
- Implement **8–10** high-value actions procedurally first: idle, walk, run, wave, point, sit, stand, talk (gesture), look-around, celebrate.
- **Animation state machine** per character: queue clips from timeline data (even if one clip initially).
- Unit tests: deterministic pose at `frame` / `t`.
- Docs: `CHARACTER_ACTION_LIBRARY.md`.

### 6.3 — Environment & asset system

- **5 presets** low-poly: `studio_grid` (current), `living_room`, `street`, `park`, `office` — built from primitives/instancing first (no heavy GLB).
- Asset registry + license fields; **no** unlicensed downloads in CI.
- `environmentId` on scene graph v2.
- Docs: `ENVIRONMENT_LIBRARY.md`.

### 6.4 — Character–environment interaction

- Schema: `interactions[]` (type, targetObjectId, time range).
- Implement **3** patterns: walk-to-point (root translation), sit-on-marker, look-at-target.
- AI Director: constrained enums from registry (Zod `z.enum`).

### 6.5 — Camera system

- Camera **keyframes** in timeline; interpolate position/fov in Remotion.
- Map existing presets → default keyframe set; add follow/pan.

### 6.6 — Timeline & animation editor

- Web: scene timeline track UI (MVP: list clips + start/duration numeric).
- API: PATCH scene timeline JSON; autosave debounce.
- Preview: scrub `useCurrentFrame` in R3F canvas.

### 6.7 — Render optimization

- Worker jobs; progress `%`; cancel; memory guard.
- Modes: `preview` (540p, low jpeg), `standard`, `hq`.
- Config via render request body + studio defaults `.env`.

### 6.8 — Quality testing & benchmark

- Scripted render of 7 sample scenarios (spec §10).
- FFprobe frame count, duration vs audio; document RAM/time on target laptop.
- `PHASE_6_TEST_REPORT.md` with **Implemented / Tested / Verified** matrix.

---

## 14. Mapping to Phase 6 acceptance criteria (§13)

| # | Criterion | 6.1 status |
|---|-----------|------------|
| 1 | Many animations working | **Partial** (5 procedural) |
| 2 | Combine animations in one scene | **No** |
| 3 | ≥5 environment presets | **No** |
| 4 | Houses, trees, road, furniture | **No** |
| 5 | Place character in environment | **Partial** (origin only) |
| 6 | Character–object interaction | **No** |
| 7 | Camera motion / tracking | **No** |
| 8 | Timeline editor | **No** |
| 9 | Scene preview | **Partial** (single preset) |
| 10 | MP4 export | **Yes** |
| 11 | A/V sync | **Scene-level** (WAV length) |
| 12 | No black/frozen frames | **Not validated** |
| 13 | No memory leaks | **Not validated** |
| 14 | Progress + cancel | **No** |
| 15 | Target hardware | **Not benchmarked** |
| 16 | No regression | **e2e PASS** |

---

## 15. Open decisions (need product input before 6.2)

1. **GLB hero character** — approve download (size + license) vs stay procedural through 6.4?
2. **Scene graph v2** — single breaking version vs parallel files?
3. **Subtitle burn-in** — Remotion text layer vs ffmpeg post-pass?
4. **Redis/BullMQ** — enable in Laragon for 6.7 or defer worker to 6.7b?

---

## 16. Conclusion — Milestone 6.1

| Question | Answer |
|----------|--------|
| Is Phase 5 render pipeline real? | **Yes** — Remotion + FFmpeg + DB + MP4 on disk |
| Can Phase 6 stack on current code? | **Yes** — extend schemas, shared renderer, worker |
| Is Phase 6 acceptance met? | **No** |
| Blockers to start 6.2? | **None critical** — need user confirm on §15 |

**STOP HERE** per process — await user confirmation before **Milestone 6.2**.

---

## Appendix A — Key file map

| Area | Path |
|------|------|
| Animation presets | `packages/animation-engine/src/presets.ts` |
| Graph compile | `packages/animation-engine/src/build-scene-graph.ts` |
| Graph schema | `packages/validation/src/scene-graph.ts` |
| Web stickman | `apps/web/src/components/stickman-figure.tsx` |
| Remotion composition | `packages/video-engine/remotion/ProjectVideo.tsx`, `scene-3d-shot.tsx` |
| Render orchestration | `apps/api/src/render/project-render.service.ts` |
| Render core | `packages/video-engine/src/render-project-video.ts` |
| AI storyboard | `packages/ai-engine/src/ai-director.ts` |
| Worker | `apps/worker/src/index.ts` (placeholder) |