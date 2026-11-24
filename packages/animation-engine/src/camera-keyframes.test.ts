import { describe, expect, it } from 'vitest';

import { sampleCameraAtTime } from './camera-keyframes.js';

describe('sampleCameraAtTime', () => {
  it('interpolates between two keyframes', () => {
    const at0 = sampleCameraAtTime(
      [
        {
          timeSec: 0,
          position: [0, 1, 6],
          target: [0, 1, 0],
          fov: 50,
        },
        {
          timeSec: 4,
          position: [0, 1, 3],
          target: [0, 1, 0],
          fov: 40,
        },
      ],
      'wide-shot',
      2,
    );
    expect(at0.position[2]).toBeGreaterThan(3);
    expect(at0.position[2]).toBeLessThan(6);
    expect(at0.fov).toBeGreaterThan(40);
    expect(at0.fov).toBeLessThan(50);
  });
});