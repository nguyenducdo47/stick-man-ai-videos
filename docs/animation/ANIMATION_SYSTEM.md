# Animation system (Phase 6+)

## Registry

- Action ids: `packages/validation/src/actions.ts` (`ACTION_ID_LIST`)
- Definitions: `packages/animation-engine/src/action-registry.ts`
- Motion: **procedural** (`packages/stickman-renderer/src/procedural-pose.ts`) unless a hero GLB provides skeletal clips (`implementation: gltf_clip`).

## Scene data

- **v1** `scene-graph.v1.json` — one animation + camera preset per scene (Phases 3–5).
- **v2** `scene-graph.v2.json` — `environmentId`, `actionClips[]`, optional `subtitleText` (parallel v1 for compat).

Compile: `GET|POST /v1/projects/:id/scene-graph-v2`.

## Rendering

Shared preview + Remotion: `@ai-video-studio/stickman-renderer`.

Hero GLB (optional): `data/assets/characters/stickman-hero.glb` — see [data/assets/characters/README.md](../../data/assets/characters/README.md).