import { z } from 'zod';

export const ENVIRONMENT_ID_LIST = [
  'studio_grid',
  'living_room',
  'street',
  'park',
  'office',
] as const;

export const environmentIdSchema = z.enum(ENVIRONMENT_ID_LIST);

export type EnvironmentId = z.infer<typeof environmentIdSchema>;