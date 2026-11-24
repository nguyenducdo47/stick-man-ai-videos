# Stickman 3D scene graph (Phase 3)

Phase 3 turns PostgreSQL **scenes** into a versioned **scene graph** JSON for shared 3D stickman animation (red hoodie) and camera presets. Binary assets stay on disk under `data/projects/<projectPublicId>/`.

## Packages

- `packages/animation-engine` — preset registry, `buildSceneGraph()`
- `packages/validation` — `sceneGraphDocumentSchema`
- `packages/storage` — `projectSceneGraphFile()`
- `apps/web` — Three.js preview (`SceneGraphCanvas`)

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/projects/:publicId/scene-graph` | Compile graph from DB (`?save=true` writes JSON) |
| POST | `/v1/projects/:publicId/scene-graph/compile` | Compile and save to `data/projects/.../scene-graph.v1.json` |

## Presets

Animation: `idle`, `walk`, `point`, `wave`, `sit` (unknown → `idle`).  
Camera: `wide-shot`, `medium-shot`, `close-up`, `zoom-in`, `tracking` (unknown → `wide-shot`).

## UI

On the project page, **3D scene graph** refreshes from the API; pick a scene tab for the local WebGL preview. **Save graph to data/** persists JSON for Phase 5 render.

## Storage path

With default `STORAGE_ROOT=./data`, the API resolves to the **monorepo** folder `data/` when started from `apps/api` (`resolveDataRoot` in `packages/storage`).

## Next (Phase 4+)

Local TTS attaches per-locale audio; Remotion uses the same graph for frame timing.