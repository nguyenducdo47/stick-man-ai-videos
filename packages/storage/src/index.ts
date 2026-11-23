import path from 'node:path';

export function resolveStoragePath(root: string, ...segments: string[]): string {
  return path.resolve(root, ...segments);
}