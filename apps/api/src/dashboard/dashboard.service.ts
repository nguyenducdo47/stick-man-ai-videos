import { Injectable } from '@nestjs/common';
import type { DashboardStats } from '@ai-video-studio/validation';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const userId = await this.users.getLocalUserId();
    const projectCount = await this.prisma.client.project.count({ where: { userId } });
    const sceneCount = await this.prisma.client.scene.count({
      where: { project: { userId } },
    });
    const grouped = await this.prisma.client.project.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true },
    });
    const statusCounts = {
      DRAFT: 0,
      SCRIPTING: 0,
      STORYBOARD: 0,
      READY: 0,
    };
    for (const row of grouped) {
      statusCounts[row.status] = row._count._all;
    }
    return { projectCount, sceneCount, statusCounts };
  }
}