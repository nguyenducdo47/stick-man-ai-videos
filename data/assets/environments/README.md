# Environment GLB files

One file per `environmentId` (lowercase):

```
living_room.glb
street.glb
park.glb
office.glb
```

- License: **CC0 or Kenney/Quaternius/KayKit** only unless you own rights.
- Served at `GET /v1/assets/environments/{id}.glb`
- Missing file → renderer falls back to procedural illustration scene.

Install or smoke-test:

```powershell
node scripts/install-cc0-glb-assets.mjs --list
node scripts/install-cc0-glb-assets.mjs --smoke-test
# After reviewing licenses/size:
node scripts/install-cc0-glb-assets.mjs --confirm-download
```