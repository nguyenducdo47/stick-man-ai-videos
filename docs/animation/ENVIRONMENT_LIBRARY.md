# Environment library (Phase 6.3+)

**Procedural** illustration scenes ship by default (bright low-poly). When present, **`data/assets/environments/{id}.glb`** replaces procedural geometry for that preset (HTTP `GET /v1/assets/environments/{id}.glb`). Optional hero: `data/assets/characters/stickman-hero.glb`. Install/smoke-test: `node scripts/install-cc0-glb-assets.mjs`.

| id | Look | Notes |
|----|------|--------|
| `studio_grid` | Dark editor grid | Legacy box props if `propIds` set |
| `living_room` | Warm peach walls, cream sofa, lamp, TV | `living_room` in scene config |
| `street` | Sunny sidewalk, grass, red building, hoop | suburban / park edge |
| `park` | Pine trees, pond, gazebo, stone path | matches outdoor references |
| `office` | Drop ceiling tiles, orange chairs, binders | tan carpet floor |

Set per scene via `Scene.config.environmentId` in DB or v2 graph `environmentId`.

Implementation:

- Presets + lighting: `packages/animation-engine/src/environment-presets.ts`
- Illustrated geometry: `packages/stickman-renderer/src/environment-illustration-scenes.tsx`
- Ground / fog: `packages/stickman-renderer/src/environment-props.tsx`

For **closer** parity with reference art (sofa cushions, detailed characters, textured foliage), add licensed GLB packs and register paths in `data/studio/assets.v1.json` — do not auto-download large models.