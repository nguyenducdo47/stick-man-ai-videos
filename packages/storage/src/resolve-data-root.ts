import { resolve } from 'node:path';

/**
 * Resolve STORAGE_ROOT when API runs from `apps/api` but data lives at repo root.
 */
export function resolveDataRoot(processCwd: string, storageRootEnv: string): string {
  const env = storageRootEnv.trim() || './data';
  if (/^[A-Za-z]:[\\/]/.test(env) || env.startsWith('/')) {
    return resolve(env);
  }
  const normalizedCwd = processCwd.replace(/\\/g, '/');
  if (normalizedCwd.endsWith('/apps/api') && (env === './data' || env === 'data')) {
    return resolve(processCwd, '..', '..', 'data');
  }
  return resolve(processCwd, env);
}