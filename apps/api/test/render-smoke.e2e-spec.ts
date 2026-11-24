import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

const runSmoke = process.env.RUN_RENDER_SMOKE === '1';

describe(`Render smoke (e2e)${runSmoke ? '' : ' [skipped]'}`, () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  (runSmoke ? it : it.skip)(
    'GET /v1/render/status exposes ffmpeg + remotion entry',
    async () => {
      const res = await request(app.getHttpServer()).get('/v1/render/status');
      expect(res.status).toBe(200);
      expect(typeof res.body.ffmpegAvailable).toBe('boolean');
      expect(res.body.remotionEntry).toBeTruthy();
    },
  );
});