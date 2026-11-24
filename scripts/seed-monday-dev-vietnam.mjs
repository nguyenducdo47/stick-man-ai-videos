/**
 * One-shot: tạo project 30s / 4 cảnh — lập trình viên VN thứ Hai.
 * Usage: node scripts/seed-monday-dev-vietnam.mjs
 */
const API = process.env.API_URL ?? 'http://127.0.0.1:3001';

const SCRIPT_DRAFT = `Kịch bản video hoạt hình 3D (30 giây)
Chủ đề: Lập trình viên Việt Nam đi làm vào sáng thứ Hai

Cảnh 1 (0–7.5s): Phòng ngủ Hà Nội, ánh sáng sớm. Stickman thức dậy, xem điện thoại.
Cảnh 2 (7.5–15s): Chuẩn bị buổi sáng (phòng tắm / đồng phục).
Cảnh 3 (15–22.5s): Đường phố Hà Nội, đi bộ tới công ty.
Cảnh 4 (22.5–30s): Văn phòng, gõ code với cốc cà phê.
`;

const SCENES = [
  {
    sortOrder: 0,
    title: 'Thức dậy thứ Hai',
    description:
      'Phòng ngủ nhỏ ở Hà Nội, ánh sáng sớm chiếu qua cửa sổ. Giấc ngủ mờ ảo, điện thoại trên bàn ngủ.',
    characterAction: 'Mở mắt, nhấp nhô nhẹ, xem giờ trên điện thoại, mỉm cười.',
    animationPreset: 'idle',
    cameraPreset: 'close-up',
    durationSec: 7.5,
    config: {
      environmentId: 'living_room',
      actionClips: [{ actionId: 'talk', startSec: 0, durationSec: 7.5, blendSec: 0.25 }],
    },
    vi: 'Chào buổi sáng! Hôm nay là thứ Hai rồi.',
    en: 'Good morning! Today is Monday.',
  },
  {
    sortOrder: 1,
    title: 'Chuẩn bị đi làm',
    description:
      'Góc phòng sáng trắng — đánh răng, mặc áo thun trắng, cầm điện thoại.',
    characterAction: 'Đánh răng, xoa đầu, mặc áo thun, vội vã sẵn sàng ra cửa.',
    animationPreset: 'wave',
    cameraPreset: 'medium-shot',
    durationSec: 7.5,
    config: {
      environmentId: 'living_room',
      actionClips: [{ actionId: 'wave', startSec: 0, durationSec: 7.5, blendSec: 0.25 }],
    },
    vi: 'Mình cần tập trung vào công việc sớm hôm nay.',
    en: 'I need to focus on work today.',
  },
  {
    sortOrder: 2,
    title: 'Đi làm sáng sớm',
    description:
      'Đường phố Hà Nội sáng sớm, nắng mờ. Đi bộ qua khu phố, check điện thoại, bước vào cửa công ty.',
    characterAction: 'Check tin nhắn, bước nhanh, mỉm cười khi thấy cửa công ty.',
    animationPreset: 'walk',
    cameraPreset: 'tracking',
    durationSec: 7.5,
    config: {
      environmentId: 'street',
      actionClips: [{ actionId: 'walk', startSec: 0, durationSec: 7.5, blendSec: 0.25 }],
      interactions: [
        {
          id: 'commute-walk',
          type: 'walk_to',
          startSec: 0,
          durationSec: 7,
          targetPosition: [0.8, 0, -1.5],
        },
      ],
    },
    vi: 'Chưa có email từ team, nhưng mình đã sẵn sàng!',
    en: 'No emails from the team yet, but I\'m ready!',
  },
  {
    sortOrder: 3,
    title: 'Bắt đầu code',
    description:
      'Văn phòng hiện đại: laptop sáng, cốc cà phê, Stickman gõ code tập trung.',
    characterAction: 'Nhấn phím, cười nhỏ, nhìn màn hình tập trung.',
    animationPreset: 'sit',
    cameraPreset: 'medium-shot',
    durationSec: 7.5,
    config: {
      environmentId: 'office',
      actionClips: [{ actionId: 'sit', startSec: 0, durationSec: 7.5, blendSec: 0.25 }],
    },
    vi: 'Mình sẽ làm xong project này sớm!',
    en: "I'll finish this project early!",
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
      title: 'LP Việt Nam — sáng thứ Hai',
      topic:
        'Video 3D stickman 30 giây: lập trình viên Việt Nam thức dậy, chuẩn bị, đi làm và bắt đầu code.',
      languages: ['vi', 'en'],
      targetSceneCount: 4,
      targetDurationSec: 30,
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
  console.log('Web UI:', `http://localhost:3000/projects/${project.publicId}`);
  console.log('Scene graph:', compileV1.savedPath);
  console.log('Scene graph v2:', compileV2.savedPath);
  console.log('Scene IDs:', createdScenes.join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});