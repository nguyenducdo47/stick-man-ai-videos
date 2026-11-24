/**
 * Project "Một ngày" — 6 cảnh, 12 cử chỉ, ~48s, VI/EN.
 * Usage: node scripts/seed-daily-life-gestures.mjs
 */
const API = process.env.API_URL ?? 'http://127.0.0.1:3001';

const SCRIPT_DRAFT = `Kịch bản hoạt hình 3D (48 giây) — một ngày sinh hoạt với cử chỉ đa dạng.

Cảnh 1 (0–8s): Thức giấc phòng khách — talk, wave.
Cảnh 2 (8–16s): Ra cửa đường phố — open_door, walk.
Cảnh 3 (16–24s): Nghỉ công viên — think, look_around.
Cảnh 4 (24–32s): Họp văn phòng — sit, explain.
Cảnh 5 (32–40s): Làm việc nhóm — point, shake_hands.
Cảnh 6 (40–48s): Về nhà — run, celebrate.
`;

const SCENES = [
  {
    sortOrder: 0,
    title: 'Thức giấc',
    description: 'Sáng sớm trong phòng khách ấm, ánh nắng nhẹ.',
    characterAction: 'Chào buổi sáng, vẫy tay chào hàng xóm.',
    animationPreset: 'wave',
    cameraPreset: 'close-up',
    durationSec: 8,
    config: {
      environmentId: 'living_room',
      actionClips: [
        { actionId: 'talk', startSec: 0, durationSec: 4, blendSec: 0.25 },
        { actionId: 'wave', startSec: 4, durationSec: 4, blendSec: 0.25 },
      ],
    },
    vi: 'Chào buổi sáng! Hôm nay trời đẹp quá.',
    en: 'Good morning! What a beautiful day.',
  },
  {
    sortOrder: 1,
    title: 'Ra cửa đi làm',
    description: 'Vỉa hè và đường phố sáng, bước ra khỏi nhà.',
    characterAction: 'Mở cửa, đi bộ dọc vỉa hè.',
    animationPreset: 'walk',
    cameraPreset: 'tracking',
    durationSec: 8,
    config: {
      environmentId: 'street',
      actionClips: [
        { actionId: 'open_door', startSec: 0, durationSec: 3, blendSec: 0.2 },
        { actionId: 'walk', startSec: 3, durationSec: 5, blendSec: 0.25 },
      ],
      interactions: [
        {
          id: 'street-commute',
          type: 'walk_to',
          startSec: 3,
          durationSec: 5,
          targetPosition: [0.6, 0, -2],
        },
      ],
    },
    vi: 'Mình đi làm thôi.',
    en: "I'm heading to work.",
  },
  {
    sortOrder: 2,
    title: 'Giờ nghỉ công viên',
    description: 'Ghế công viên, cây xanh, không khí trong lành.',
    characterAction: 'Suy ngẫm, nhìn xung quanh thư thái.',
    animationPreset: 'idle',
    cameraPreset: 'wide-shot',
    durationSec: 8,
    config: {
      environmentId: 'park',
      actionClips: [
        { actionId: 'think', startSec: 0, durationSec: 4, blendSec: 0.25 },
        { actionId: 'look_around', startSec: 4, durationSec: 4, blendSec: 0.25 },
      ],
    },
    vi: 'Nghỉ vài phút cho đỡ mệt.',
    en: 'A short break to recharge.',
  },
  {
    sortOrder: 3,
    title: 'Họp nhanh',
    description: 'Phòng họp nhỏ, bàn và ghế văn phòng.',
    characterAction: 'Ngồi xuống, giải thích ý tưởng cho team.',
    animationPreset: 'sit',
    cameraPreset: 'medium-shot',
    durationSec: 8,
    config: {
      environmentId: 'office',
      actionClips: [
        { actionId: 'sit', startSec: 0, durationSec: 3.5, blendSec: 0.25 },
        { actionId: 'explain', startSec: 3.5, durationSec: 4.5, blendSec: 0.25 },
      ],
    },
    vi: 'Để mình giải thích ý tưởng này.',
    en: 'Let me explain this idea.',
  },
  {
    sortOrder: 4,
    title: 'Làm việc nhóm',
    description: 'Hai nhân vật bàn việc tại bàn làm.',
    characterAction: 'Chỉ vào màn hình, bắt tay thỏa thuận.',
    animationPreset: 'point',
    cameraPreset: 'medium-shot',
    durationSec: 8,
    config: {
      environmentId: 'office',
      actionClips: [
        { actionId: 'point', startSec: 0, durationSec: 4, blendSec: 0.25 },
        { actionId: 'shake_hands', startSec: 4, durationSec: 4, blendSec: 0.25 },
      ],
    },
    vi: 'Đúng chỗ này — deal!',
    en: 'Right here — deal!',
  },
  {
    sortOrder: 5,
    title: 'Về nhà',
    description: 'Chiều tối, trở lại phòng khách ấm.',
    characterAction: 'Chạy vui vào nhà, ăn mừng xong việc.',
    animationPreset: 'walk',
    cameraPreset: 'wide-shot',
    durationSec: 8,
    config: {
      environmentId: 'living_room',
      actionClips: [
        { actionId: 'run', startSec: 0, durationSec: 4, blendSec: 0.25 },
        { actionId: 'celebrate', startSec: 4, durationSec: 4, blendSec: 0.25 },
      ],
    },
    vi: 'Xong việc! Về nhà nghỉ thôi.',
    en: "Done! Time to relax at home.",
  },
];

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} → ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function main() {
  const project = await api('/v1/projects', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Một ngày — cử chỉ đa dạng',
      topic:
        'Video 3D 48 giây: một ngày sinh hoạt với 12+ cử chỉ stickman — sáng, đi làm, nghỉ, văn phòng, về nhà.',
      languages: ['vi', 'en'],
      targetSceneCount: 6,
      targetDurationSec: 48,
      visualStyle: 'stickman-red-hoodie',
    }),
  });

  console.log('Project:', project.publicId, project.title);

  await api(`/v1/projects/${project.publicId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      scriptDraft: SCRIPT_DRAFT,
      status: 'STORYBOARD',
    }),
  });

  const createdScenes = [];
  for (const s of SCENES) {
    const scene = await api(`/v1/projects/${project.publicId}/scenes`, {
      method: 'POST',
      body: JSON.stringify({
        title: s.title,
        description: s.description,
        characterAction: s.characterAction,
        animationPreset: s.animationPreset,
        cameraPreset: s.cameraPreset,
        durationSec: s.durationSec,
        sortOrder: s.sortOrder,
      }),
    });
    await api(`/v1/scenes/${scene.publicId}`, {
      method: 'PATCH',
      body: JSON.stringify({ config: s.config }),
    });
    await api(`/v1/scenes/${scene.publicId}/localizations/vi`, {
      method: 'PATCH',
      body: JSON.stringify({ narration: s.vi, subtitles: s.vi }),
    });
    await api(`/v1/scenes/${scene.publicId}/localizations/en`, {
      method: 'PATCH',
      body: JSON.stringify({ narration: s.en, subtitles: s.en }),
    });
    createdScenes.push(scene.publicId);
    console.log('Scene', s.sortOrder + 1, scene.publicId, s.title);
  }

  await api(`/v1/projects/${project.publicId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'READY' }),
  });

  const compileV1 = await api(`/v1/projects/${project.publicId}/scene-graph/compile`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  const compileV2 = await api(`/v1/projects/${project.publicId}/scene-graph-v2/compile`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  console.log('\nDone.');
  console.log('publicId:', project.publicId);
  console.log('Web UI:', `http://localhost:3000/projects/${project.publicId}`);
  console.log('Scene graph:', compileV1.savedPath);
  console.log('Scene graph v2:', compileV2.savedPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});