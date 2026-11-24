import {
  aiScriptOutputSchema,
  aiStoryboardOutputSchema,
  type AiGenerateOptions,
  type AiScriptOutput,
  type AiStoryboardOutput,
} from '@ai-video-studio/validation';

import { generateStructuredOutput } from './structured-llm.js';
import type { LLMProvider } from './types.js';

export interface DirectorProjectContext {
  title: string;
  topic: string;
  targetDurationSec?: number | null;
  targetSceneCount?: number | null;
  visualStyle?: string | null;
  languages: string[];
  /** Saved notes / brief from script draft — not used as final script verbatim. */
  creativeBrief?: string | null;
}

const STICKMAN_BRIEF =
  'Visual: 3D stickman, minimalist, white body, red hoodie, black sneakers. Shared scenes for all locales.';

export class AiDirector {
  constructor(private readonly llm: LLMProvider) {}

  async generateScript(
    ctx: DirectorProjectContext,
    options?: AiGenerateOptions,
  ): Promise<AiScriptOutput> {
    const duration = ctx.targetDurationSec ?? 120;
    const scenes = ctx.targetSceneCount ?? 5;
    const style = ctx.visualStyle ?? 'stickman-red-hoodie';
    const brief =
      ctx.creativeBrief?.trim() &&
      ctx.creativeBrief.trim().length >= 10
        ? `

User creative brief (expand into a full script; do not copy verbatim only if too short):
"""
${ctx.creativeBrief.trim().slice(0, 8_000)}
"""`
        : '';

    const prompt = `You are a video scriptwriter for a stickman explainer video.

Project title: ${ctx.title}
Topic: ${ctx.topic}
Target duration: about ${duration} seconds
Target scene count: about ${scenes} scenes
Visual style: ${style}
Languages: ${ctx.languages.join(', ')}
${STICKMAN_BRIEF}
${brief}

Write a narration-ready script with clear scene breaks (Scene 1, Scene 2, ...).
Include both Vietnamese and English friendly phrasing notes where helpful inside the script text.

Respond with JSON only:
{
  "script": "full script text",
  "synopsis": "one paragraph summary"
}`;

    return generateStructuredOutput(this.llm, aiScriptOutputSchema, prompt, {
      model: options?.model,
      temperature: options?.temperature ?? 0.6,
      system: 'You output strict JSON for a local video studio pipeline. No markdown.',
      jsonMode: true,
      maxAttempts: 2,
      numPredict: 4_096,
    });
  }

  async generateStoryboard(
    ctx: DirectorProjectContext,
    scriptDraft: string,
    options?: AiGenerateOptions,
  ): Promise<AiStoryboardOutput> {
    const sceneTarget = ctx.targetSceneCount ?? 5;

    const prompt = `You are a storyboard director for stickman videos.

Project title: ${ctx.title}
Topic: ${ctx.topic}
Scene target count: ${sceneTarget}
${STICKMAN_BRIEF}

Script:
"""
${scriptDraft.slice(0, 12_000)}
"""

Create exactly ${sceneTarget} scenes (or fewer only if script is very short).
For each scene provide shared visual fields plus separate Vietnamese and English narration.

Use ONLY these animationPreset (action) ids: idle, walk, run, jump, sit, wave, point, talk, explain, think, look_around, celebrate.
Use ONLY cameraPreset ids: wide-shot, medium-shot, close-up, zoom-in, tracking.
Use ONLY environmentId: studio_grid, living_room, street, park, office.

JSON only:
{
  "scenes": [
    {
      "title": "string",
      "description": "visual scene description",
      "characterAction": "what stickman does",
      "animationPreset": "idle",
      "cameraPreset": "wide-shot",
      "environmentId": "studio_grid",
      "durationSec": 8,
      "narrationVi": "Vietnamese narration",
      "narrationEn": "English narration"
    }
  ]
}`;

    const raw = await generateStructuredOutput(
      this.llm,
      aiStoryboardOutputSchema,
      prompt,
      {
        model: options?.model,
        temperature: options?.temperature ?? 0.5,
        system:
          'You output strict JSON for a local video studio pipeline. No markdown.',
        jsonMode: true,
        maxAttempts: 2,
        numPredict: 6_144,
      },
    );
    return aiStoryboardOutputSchema.parse(raw);
  }
}