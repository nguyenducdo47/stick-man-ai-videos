import { join, resolve } from 'node:path';

export function projectDataDir(storageRoot: string, projectPublicId: string): string {
  return resolve(storageRoot, 'projects', projectPublicId);
}

export function projectSceneGraphFile(
  storageRoot: string,
  projectPublicId: string,
): string {
  return join(projectDataDir(storageRoot, projectPublicId), 'scene-graph.v1.json');
}