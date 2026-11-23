import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  LOCAL_STUDIO_EMAIL,
  LOCAL_STUDIO_USER_PUBLIC_ID,
} from '@ai-video-studio/database';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService implements OnModuleInit {
  private localUserId: bigint | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureLocalUser();
  }

  async ensureLocalUser() {
    const user = await this.prisma.client.user.upsert({
      where: { email: LOCAL_STUDIO_EMAIL },
      update: { displayName: 'Local Studio' },
      create: {
        publicId: LOCAL_STUDIO_USER_PUBLIC_ID,
        email: LOCAL_STUDIO_EMAIL,
        displayName: 'Local Studio',
      },
    });
    this.localUserId = user.id;
    return user;
  }

  async getLocalUserId(): Promise<bigint> {
    if (this.localUserId === null) {
      const user = await this.ensureLocalUser();
      return user.id;
    }
    return this.localUserId;
  }
}
