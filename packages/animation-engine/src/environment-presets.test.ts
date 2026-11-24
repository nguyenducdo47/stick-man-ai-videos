import { describe, expect, it } from 'vitest';

import { ENVIRONMENT_ID_LIST } from '@ai-video-studio/validation';

import { ENVIRONMENT_PRESETS, resolveEnvironmentId } from './environment-presets.js';

describe('environment presets (Phase 7)', () => {
  it('defines a preset for every environment id', () => {
    for (const id of ENVIRONMENT_ID_LIST) {
      expect(ENVIRONMENT_PRESETS[id]?.id).toBe(id);
    }
  });

  it('includes bedroom and bathroom interior presets', () => {
    expect(ENVIRONMENT_PRESETS.bedroom.label).toMatch(/bedroom/i);
    expect(ENVIRONMENT_PRESETS.bathroom.label).toMatch(/bathroom/i);
    expect(resolveEnvironmentId('bedroom')).toBe('bedroom');
    expect(resolveEnvironmentId('bathroom')).toBe('bathroom');
  });
});