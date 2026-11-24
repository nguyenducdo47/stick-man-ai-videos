import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

describe('Assets (e2e)', () => {
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

  it('GET /v1/assets/status returns registry', async () => {
    const res = await request(app.getHttpServer()).get('/v1/assets/status');
    expect(res.status).toBe(200);
    expect(res.body.registryVersion).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('HEAD hero returns 200 or 404', async () => {
    const res = await request(app.getHttpServer()).head('/v1/assets/stickman-hero.glb');
    expect([200, 404]).toContain(res.status);
  });

  it('GET /v1/assets/stickman-hero.glb returns 200 or 404', async () => {
    const res = await request(app.getHttpServer()).get('/v1/assets/stickman-hero.glb');
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers['content-type']).toMatch(/model\/gltf-binary/i);
    }
  });

  it('GET unknown environment asset returns 404', async () => {
    await request(app.getHttpServer())
      .get('/v1/assets/environments/not-a-preset.glb')
      .expect(404);
  });

  it('GET studio_grid environment GLB returns 404', async () => {
    await request(app.getHttpServer())
      .get('/v1/assets/environments/studio_grid.glb')
      .expect(404);
  });

  it('GET /v1/assets/environments/living_room.glb when file exists returns 200', async () => {
    const res = await request(app.getHttpServer()).get(
      '/v1/assets/environments/living_room.glb',
    );
    if (res.status === 200) {
      expect(res.headers['content-type']).toMatch(/model\/gltf-binary/i);
    } else {
      expect(res.status).toBe(404);
    }
  });
});