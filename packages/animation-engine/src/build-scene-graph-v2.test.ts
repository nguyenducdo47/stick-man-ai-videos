import { describe, expect, it } from 'vitest';

import { buildSceneGraphV2 } from './build-scene-graph-v2.js';

describe('buildSceneGraphV2', () => {
  it('adds action clips and environment defaults', () => {
    const graph = buildSceneGraphV2({
      projectPublicId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      visualStyle: 'stickman-red-hoodie',
      scenes: [
        {
          publicId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
          sortOrder: 0,
          title: 'Walk scene',
          description: 'Test',
          characterAction: null,
          animationPreset: 'walk',
          cameraPreset: 'wide-shot',
          durationSec: 6,
        },
      ],
    });
    expect(graph.version).toBe(2);
    expect(graph.scenes[0]?.actionClips[0]?.actionId).toBe('walk');
    expect(graph.scenes[0]?.environmentId).toBe('studio_grid');
  });
});