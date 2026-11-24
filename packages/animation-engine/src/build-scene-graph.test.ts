import { describe, expect, it } from 'vitest';

import { buildSceneGraph } from './build-scene-graph.js';

describe('buildSceneGraph', () => {
  it('normalizes unknown presets and sums duration', () => {
    const graph = buildSceneGraph({
      projectPublicId: '00000000-0000-4000-a000-000000000001',
      visualStyle: 'stickman-red-hoodie',
      scenes: [
        {
          publicId: '10000000-0000-4000-a000-000000000010',
          sortOrder: 1,
          title: 'B',
          description: null,
          characterAction: null,
          animationPreset: 'unknown',
          cameraPreset: 'zoom-in',
          durationSec: 5,
        },
        {
          publicId: '10000000-0000-4000-a000-000000000011',
          sortOrder: 0,
          title: 'A',
          description: null,
          characterAction: null,
          animationPreset: 'walk',
          cameraPreset: null,
          durationSec: 3,
        },
      ],
      compiledAt: '2026-11-24T00:00:00.000Z',
    });

    expect(graph.scenes[0]!.sortOrder).toBe(0);
    expect(graph.scenes[0]!.animationPreset).toBe('walk');
    expect(graph.scenes[1]!.animationPreset).toBe('idle');
    expect(graph.scenes[1]!.cameraPreset).toBe('zoom-in');
    expect(graph.totalDurationSec).toBe(8);
    expect(graph.character.style).toBe('stickman-red-hoodie');
  });
});