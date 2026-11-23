import { z } from 'zod';

export const dashboardStatsSchema = z.object({
  projectCount: z.number().int(),
  sceneCount: z.number().int(),
  statusCounts: z.object({
    DRAFT: z.number().int(),
    SCRIPTING: z.number().int(),
    STORYBOARD: z.number().int(),
    READY: z.number().int(),
  }),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;