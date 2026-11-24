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