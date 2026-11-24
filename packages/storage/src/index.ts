import path from 'node:path';

export function resolveStoragePath(root: string, ...segments: string[]): string {
  return path.resolve(root, ...segments);
}

export {
  projectDataDir,
  projectSceneGraphFile,
  projectSceneGraphV2File,
  stickmanHeroGlbRelPath,
  stickmanHeroGlbFile,
  environmentGlbRelPath,
  environmentGlbFile,
  environmentGlbPublicPath,
  stickmanHeroGlbPublicPath,
  sceneNarrationAudioFile,
  sceneNarrationAudioRelPath,
  projectRenderVideoRelPath,
  projectRenderVideoFile,
} from './project-paths.js';
export { resolveDataRoot } from './resolve-data-root.js';