import type { EnvironmentId, StudioAssetsStatusResponse } from '@ai-video-studio/validation';

import { apiFetch } from '@/lib/api';

const API_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://127.0.0.1:3001';

function apiBase(): string {
  return API_BASE.replace(/\/$/, '');
}

export function heroGlbAssetUrl(): string {
  return `${apiBase()}/v1/assets/stickman-hero.glb`;
}

export function environmentGlbAssetUrl(environmentId: EnvironmentId): string | null {
  if (environmentId === 'studio_grid') return null;
  return `${apiBase()}/v1/assets/environments/${environmentId}.glb`;
}

/** HEAD probe — avoids 404 noise in R3F when GLB missing (Phase 7). */
export async function probeUrlExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

export function fetchStudioAssetsStatus(): Promise<StudioAssetsStatusResponse> {
  return apiFetch<StudioAssetsStatusResponse>('/v1/assets/status');
}

export function resolveHeroGlbFromStatus(
  status: StudioAssetsStatusResponse | undefined,
): string | null {
  const hero = status?.items.find((i) => i.id === 'stickman-hero-glb');
  if (hero?.installed && hero.httpUrl) return hero.httpUrl;
  return null;
}

export function resolveEnvGlbFromStatus(
  status: StudioAssetsStatusResponse | undefined,
  environmentId: EnvironmentId,
): string | null {
  if (environmentId === 'studio_grid') return null;
  const row = status?.items.find(
    (i) => i.kind === 'environment' && i.environmentId === environmentId,
  );
  if (row?.installed && row.httpUrl) return row.httpUrl;
  return null;
}