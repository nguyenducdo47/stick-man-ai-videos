# Character action library

| Action id | Label | Implementation | Notes |
|-----------|-------|----------------|-------|
| idle | Idle | procedural | Breathing bob |
| walk | Walk | procedural | Arm/leg swing |
| run | Run | procedural | Faster cycle |
| jump | Jump | procedural | Vertical bounce |
| sit | Sit | procedural | Lower body pose |
| stand_up | Stand up | procedural | Rise from sit |
| wave | Wave | procedural | Right arm |
| point | Point | procedural | Left arm extend |
| talk | Talk | procedural | Alternating arms |
| explain | Explain | procedural | Same as talk (richer later) |
| think | Think | procedural | Head turn + arm up |
| look_around | Look around | procedural | Y rotation sweep |
| turn | Turn | procedural | In-place rotation |
| pick_up / put_down | Pick / put | procedural | Torso lean |
| push / pull | Push / pull | procedural | Z drift |
| open_door / close_door | Door | procedural | Arm sweep |
| climb | Climb | procedural | Vertical move |
| fall | Fall | procedural | Tilt forward |
| celebrate | Celebrate | procedural | Arms up |
| shake_hands | Shake hands | procedural | Side rotate |

GLB clip mapping: set `gltfClipName` on `ACTION_REGISTRY` entries when hero model is installed.