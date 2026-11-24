import type { Project, Scene, SceneLocalization } from '@prisma/client';
import type {
  ProjectResponse,
  SceneResponse,
} from '@ai-video-studio/validation';
import { sceneConfigSchema } from '@ai-video-studio/validation';

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

function sceneLocaleAudioUrl(
  scenePublicId: string,
  locale: string,
  audioPath: string | null,
): string | null {
  if (!audioPath) return null;
  return `/v1/scenes/${scenePublicId}/audio/${locale}`;
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
    config: (() => {
      const parsed = sceneConfigSchema.safeParse(scene.config ?? {});
      return parsed.success ? parsed.data : {};
    })(),
    localizations: scene.localizations.map((loc) => ({
      locale: loc.locale as 'vi' | 'en',
      narration: loc.narration,
      subtitles: loc.subtitles,
      audioPath: loc.audioPath,
      audioUrl: sceneLocaleAudioUrl(scene.publicId, loc.locale, loc.audioPath),
      audioGeneratedAt: loc.audioGeneratedAt?.toISOString() ?? null,
    })),
    createdAt: scene.createdAt.toISOString(),
    updatedAt: scene.updatedAt.toISOString(),
  };
}
