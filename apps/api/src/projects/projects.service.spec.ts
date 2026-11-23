import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const prismaMock = {
    client: {
      project: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    },
  };

  const usersMock = {
    getLocalUserId: jest.fn().mockResolvedValue(BigInt(1)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UsersService, useValue: usersMock },
      ],
    }).compile();

    service = module.get(ProjectsService);
  });

  it('lists projects for local user', async () => {
    const result = await service.list();
    expect(result.total).toBe(0);
    expect(prismaMock.client.project.findMany).toHaveBeenCalled();
  });
});
