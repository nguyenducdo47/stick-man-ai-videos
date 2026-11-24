import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

describe('Projects (e2e)', () => {
  let app: INestApplication;
  let createdPublicId: string;

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

  it('GET /health returns ok', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });

  it('POST /v1/projects creates a project', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/projects')
      .send({
        title: 'E2E Stickman',
        topic: 'Acceptance test topic',
        languages: ['vi', 'en'],
        targetSceneCount: 2,
        targetDurationSec: 60,
      })
      .expect(201);

    expect(res.body.publicId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    createdPublicId = res.body.publicId;
  });

  it('GET /v1/projects lists projects including created one', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/projects')
      .expect(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(
      res.body.items.some(
        (p: { publicId: string }) => p.publicId === createdPublicId,
      ),
    ).toBe(true);
  });

  it('POST /v1/projects/:id/scenes creates scene with locales', async () => {
    const res = await request(app.getHttpServer())
      .post(`/v1/projects/${createdPublicId}/scenes`)
      .send({ title: 'Scene A', description: 'E2E scene' })
      .expect(201);

    expect(res.body.localizations).toHaveLength(2);
    expect(
      res.body.localizations.map((l: { locale: string }) => l.locale).sort(),
    ).toEqual(['en', 'vi']);
  });

  it('POST /v1/projects rejects invalid body', () => {
    return request(app.getHttpServer())
      .post('/v1/projects')
      .send({ title: '' })
      .expect(400);
  });

  it('GET /v1/dashboard/stats returns counts', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/dashboard/stats')
      .expect(200);
    expect(res.body.projectCount).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.sceneCount).toBe('number');
  });

  it('PATCH scene and localization persist', async () => {
    const list = await request(app.getHttpServer()).get(
      `/v1/projects/${createdPublicId}/scenes`,
    );
    const sceneId = list.body.items[0].publicId as string;
    await request(app.getHttpServer())
      .patch(`/v1/scenes/${sceneId}`)
      .send({ description: 'Updated description' })
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/v1/scenes/${sceneId}/localizations/vi`)
      .send({ narration: 'Xin chào' })
      .expect(200);
  });

  it('GET /v1/projects/:id/scene-graph compiles storyboard', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/projects/${createdPublicId}/scene-graph`)
      .expect(200);
    expect(res.body.graph.version).toBe(1);
    expect(res.body.graph.projectPublicId).toBe(createdPublicId);
    expect(Array.isArray(res.body.graph.scenes)).toBe(true);
  });

  it('POST /v1/projects/:id/scene-graph/compile writes JSON', async () => {
    const res = await request(app.getHttpServer())
      .post(`/v1/projects/${createdPublicId}/scene-graph/compile`)
      .send({})
      .expect(201);
    expect(res.body.savedPath).toMatch(
      /^projects\/[0-9a-f-]+\/scene-graph\.v1\.json$/i,
    );
    expect(res.body.graph.scenes.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /v1/projects/:id/scene-graph-v2 exposes v2 graph', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/projects/${createdPublicId}/scene-graph-v2`)
      .expect(200);
    expect(res.body.graph.version).toBe(2);
    expect(res.body.graph.scenes[0]?.environmentId).toBeDefined();
    expect(Array.isArray(res.body.graph.scenes[0]?.actionClips)).toBe(true);
  });

  it('POST /v1/projects/:id/ai/storyboard without script returns 400', async () => {
    const fresh = await request(app.getHttpServer())
      .post('/v1/projects')
      .send({
        title: 'No script project',
        topic: 'AI negative test',
        languages: ['vi'],
        targetSceneCount: 2,
      })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/v1/projects/${fresh.body.publicId as string}/ai/storyboard`)
      .send({})
      .expect(400);
  });

  it('GET /v1/tts/status exposes local TTS probe', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/tts/status')
      .expect(200);
    expect(typeof res.body.reachable).toBe('boolean');
    expect(res.body.serviceUrl).toMatch(/^http/);
  });

  it('GET /v1/tts/preferences returns korvaVoiceVi string', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/tts/preferences')
      .expect(200);
    expect(typeof res.body.korvaVoiceVi).toBe('string');
    expect(res.body.korvaVoiceVi.length).toBeGreaterThan(0);
  });

  it('GET /v1/render/status reports ffmpeg probe', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/render/status')
      .expect(200);
    expect(typeof res.body.ffmpegAvailable).toBe('boolean');
    expect(res.body.remotionEntry).toMatch(/remotion[\\/]index\.ts$/i);
  });

  it('POST /v1/projects/:id/render without audio is rejected', async () => {
    const status = await request(app.getHttpServer()).get('/v1/render/status');
    const res = await request(app.getHttpServer())
      .post(`/v1/projects/${createdPublicId}/render`)
      .send({ locale: 'vi' });
    if (status.body.ffmpegAvailable) {
      expect(res.status).toBe(400);
    } else {
      expect(res.status).toBe(503);
    }
  });

  it('POST scene TTS without narration returns 400', async () => {
    const list = await request(app.getHttpServer()).get(
      `/v1/projects/${createdPublicId}/scenes`,
    );
    const sceneId = list.body.items[0]?.publicId as string | undefined;
    expect(sceneId).toBeDefined();
    await request(app.getHttpServer())
      .patch(`/v1/scenes/${sceneId}/localizations/en`)
      .send({ narration: '' })
      .expect(200);
    await request(app.getHttpServer())
      .post(`/v1/scenes/${sceneId}/localizations/en/tts`)
      .send({})
      .expect(400);
  });

  it('DELETE /v1/scenes/:id removes scene', async () => {
    const list = await request(app.getHttpServer()).get(
      `/v1/projects/${createdPublicId}/scenes`,
    );
    const sceneId = list.body.items[0].publicId as string;
    await request(app.getHttpServer())
      .delete(`/v1/scenes/${sceneId}`)
      .expect(200);
    const after = await request(app.getHttpServer()).get(
      `/v1/projects/${createdPublicId}/scenes`,
    );
    expect(after.body.items.length).toBe(0);
  });
});
