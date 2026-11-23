import type { Project, Scene, SceneLocalization } from '@prisma/client';
import type {
  ProjectResponse,
  SceneResponse,
} from '@ai-video-studio/validation';

type ProjectWithCount = Project & { _count: { scenes: number } };

type SceneWithLocales = Scene & { localizations: SceneLocalization[] };

export function toProjectResponse(project: ProjectWithCount): ProjectResponse {
  return {
    publicId: project.publicId,
    title: project.title,
    topic: project.topic,
    targetDurationSec: project.targetDurationSec,
    targetSceneCount: project.targetSceneCount,
    languages: project.languages as ('vi' | 'en')[],
    visualStyle: project.visualStyle,
    scriptDraft: project.scriptDraft,
    status: project.status,
    sceneCount: project._count.scenes,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function toSceneResponse(scene: SceneWithLocales): SceneResponse {
  return {
    publicId: scene.publicId,
    sortOrder: scene.sortOrder,
    title: scene.title,
    description: scene.description,
    characterAction: scene.characterAction,
    animationPreset: scene.animationPreset,
    cameraPreset: scene.cameraPreset,
    durationSec: scene.durationSec,
    localizations: scene.localizations.map((loc) => ({
      locale: loc.locale as 'vi' | 'en',
      narration: loc.narration,
      subtitles: loc.subtitles,
    })),
    createdAt: scene.createdAt.toISOString(),
    updatedAt: scene.updatedAt.toISOString(),
  };
}
