# Stickman hero GLB (optional)

Place a **licensed** rigged stickman model here:

```
stickman-hero.glb
```

- Recommended: Mixamo / CC0 rig with walk, idle, run clips named to match `ACTION_REGISTRY` or map via `gltfClipName` in `packages/animation-engine/src/action-registry.ts`.
- **Do not** commit models with unclear license.
- If the file is missing, the studio uses **procedural** stickman (Phase 6 fallback).

API: `GET /v1/assets/stickman-hero.glb`  
Remotion bundle `publicDir` includes `data/assets/`.

Clip name map: `data/studio/gltf-action-map.v1.json` (mirrored in `packages/animation-engine/src/gltf-action-map.ts`).

Smoke-test only (Three.js RobotExpressive):

```powershell
node scripts/install-cc0-glb-assets.mjs --smoke-test
```