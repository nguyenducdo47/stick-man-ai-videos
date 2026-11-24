import { expect, test } from '@playwright/test';

const apiURL =
  process.env.PLAYWRIGHT_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:3001';

import type { APIRequestContext } from '@playwright/test';

async function apiReachable(request: APIRequestContext): Promise<boolean> {
  try {
    const res = await request.get(`${apiURL}/health`);
    return res.ok();
  } catch {
    return false;
  }
}

test.describe('Phase 7 — studio UI smoke', () => {
  test('dashboard home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'AI Video Studio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'New project' })).toBeVisible();
  });

  test('settings nav includes Assets', async ({ page }) => {
    await page.goto('/settings/assets');
    await expect(page.getByRole('heading', { name: '3D assets' })).toBeVisible();
    await expect(page.getByText(/registry v/i)).toBeVisible({ timeout: 15_000 });
  });

  test('assets page lists registry or loading', async ({ page }) => {
    await page.goto('/settings/assets');
    const table = page.getByRole('table');
    const loading = page.getByText('Loading asset probe');
    await expect(table.or(loading)).toBeVisible({ timeout: 15_000 });
  });

  test('TTS settings page loads', async ({ page }) => {
    await page.goto('/settings/tts');
    await expect(page.getByRole('heading', { name: 'Local TTS' })).toBeVisible();
  });
});

test.describe('Phase 7 — API smoke', () => {
  test('GET /health', async ({ request }) => {
    const ok = await apiReachable(request);
    test.skip(!ok, 'API not running on PLAYWRIGHT_API_URL');
    const res = await request.get(`${apiURL}/health`);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('GET /v1/assets/status', async ({ request }) => {
    const ok = await apiReachable(request);
    test.skip(!ok, 'API not running');
    const res = await request.get(`${apiURL}/v1/assets/status`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.registryVersion).toBeGreaterThanOrEqual(1);
    expect(body.items.some((i: { environmentId?: string }) => i.environmentId === 'bedroom')).toBe(
      true,
    );
  });

  test('HEAD stickman-hero returns 200 or 404', async ({ request }) => {
    const ok = await apiReachable(request);
    test.skip(!ok, 'API not running');
    const res = await request.head(`${apiURL}/v1/assets/stickman-hero.glb`);
    expect([200, 404]).toContain(res.status());
  });
});