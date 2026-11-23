import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { prisma, type PrismaClient } from '@ai-video-studio/database';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  get client(): PrismaClient {
    return prisma;
  }

  async onModuleInit() {
    await prisma.$connect();
  }

  async onModuleDestroy() {
    await prisma.$disconnect();
  }
}
