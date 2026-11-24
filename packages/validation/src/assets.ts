import { z } from 'zod';

import { environmentIdSchema } from './environments.js';

export const studioAssetKindSchema = z.enum(['character', 'environment']);

export const studioAssetItemSchema = z.object({
  id: z.string().min(1),
  kind: studioAssetKindSchema,
  environmentId: environmentIdSchema.optional(),
  path: z.string().nullable(),
  license: z.string().optional(),
  polyCountEstimate: z.number().int().nullable().optional(),
  notes: z.string().optional(),
});

export const studioAssetsRegistrySchema = z.object({
  version: z.number().int().positive(),
  items: z.array(studioAssetItemSchema),
});

export type StudioAssetsRegistry = z.infer<typeof studioAssetsRegistrySchema>;

export const studioAssetProbeItemSchema = studioAssetItemSchema.extend({
  installed: z.boolean(),
  bytes: z.number().int().nonnegative().nullable().optional(),
  httpUrl: z.string().nullable().optional(),
});

export const studioAssetsStatusResponseSchema = z.object({
  registryVersion: z.number().int().positive(),
  items: z.array(studioAssetProbeItemSchema),
});

export type StudioAssetsStatusResponse = z.infer<
  typeof studioAssetsStatusResponseSchema
>;