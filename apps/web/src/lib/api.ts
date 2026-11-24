const defaultBase =
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001');

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = defaultBase.replace(/\/$/, '');
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : undefined;
  if (!res.ok) {
    throw new ApiError(res.statusText || 'Request failed', res.status, data);
  }
  return data as T;
}

export async function apiFetchBlob(path: string, init?: RequestInit): Promise<Blob> {
  const base = defaultBase.replace(/\/$/, '');
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = text;
    }
    throw new ApiError(res.statusText || 'Request failed', res.status, data);
  }
  return res.blob();
}

export function apiAssetUrl(path: string): string {
  const base = defaultBase.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Bust browser cache after re-generating the same scene audio URL. */
export function apiAssetUrlVersioned(
  path: string,
  version: string | null | undefined,
): string {
  const base = apiAssetUrl(path);
  if (!version) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}v=${encodeURIComponent(version)}`;
}