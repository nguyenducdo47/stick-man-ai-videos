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

export function projectSceneGraphV2File(
  storageRoot: string,
  projectPublicId: string,
): string {
  return join(projectDataDir(storageRoot, projectPublicId), 'scene-graph.v2.json');
}

export const stickmanHeroGlbRelPath = join(
  'assets',
  'characters',
  'stickman-hero.glb',
).replace(/\\/g, '/');

export function stickmanHeroGlbFile(storageRoot: string): string {
  return join(storageRoot, ...stickmanHeroGlbRelPath.split('/'));
}

/** Relative path: `assets/environments/{environmentId}.glb` */
export function environmentGlbRelPath(environmentId: string): string {
  return join('assets', 'environments', `${environmentId}.glb`).replace(/\\/g, '/');
}

export function environmentGlbFile(storageRoot: string, environmentId: string): string {
  return join(storageRoot, ...environmentGlbRelPath(environmentId).split('/'));
}

/** Path under Remotion `publicDir` (typically `data/assets`). */
export function environmentGlbPublicPath(environmentId: string): string {
  return `environments/${environmentId}.glb`;
}

export function stickmanHeroGlbPublicPath(): string {
  return 'characters/stickman-hero.glb';
}

/** Relative path from storage root — Wav narration clip per scene locale. */
export function sceneNarrationAudioRelPath(
  projectPublicId: string,
  scenePublicId: string,
  locale: string,
): string {
  return join(
    'audio',
    'projects',
    projectPublicId,
    'scenes',
    scenePublicId,
    `${locale}.wav`,
  ).replace(/\\/g, '/');
}

export function sceneNarrationAudioFile(
  storageRoot: string,
  projectPublicId: string,
  scenePublicId: string,
  locale: string,
): string {
  return join(
    storageRoot,
    ...sceneNarrationAudioRelPath(projectPublicId, scenePublicId, locale).split(
      '/',
    ),
  );
}

/** Relative path from storage root — MP4 export per project locale. */
export function projectRenderVideoRelPath(
  projectPublicId: string,
  locale: string,
): string {
  return join('renders', 'projects', projectPublicId, `${locale}.mp4`).replace(
    /\\/g,
    '/',
  );
}

export function projectRenderVideoFile(
  storageRoot: string,
  projectPublicId: string,
  locale: string,
): string {
  return join(
    storageRoot,
    ...projectRenderVideoRelPath(projectPublicId, locale).split('/'),
  );
}