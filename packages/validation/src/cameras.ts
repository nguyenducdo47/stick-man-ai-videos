import { z } from 'zod';

export const CAMERA_PRESET_ID_LIST = [
  'wide-shot',
  'medium-shot',
  'close-up',
  'zoom-in',
  'tracking',
] as const;

export const cameraPresetIdSchema = z.enum(CAMERA_PRESET_ID_LIST);

export type CameraPresetId = z.infer<typeof cameraPresetIdSchema>;