import type { EnvironmentId } from '@ai-video-studio/validation';

const API_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://127.0.0.1:3001';

export function heroGlbAssetUrl(): string {
  return `${API_BASE.replace(/\/$/, '')}/v1/assets/stickman-hero.glb`;
}

export function environmentGlbAssetUrl(environmentId: EnvironmentId): string | null {
  if (environmentId === 'studio_grid') return null;
  return `${API_BASE.replace(/\/$/, '')}/v1/assets/environments/${environmentId}.glb`;
}