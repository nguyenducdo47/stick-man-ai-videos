/**
 * CC0 GLB installer — never downloads without --confirm-download.
 * --smoke-test copies Three.js sample GLBs for pipeline verification only.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const charsDir = join(DATA, 'assets', 'characters');
const envDir = join(DATA, 'assets', 'environments');

const MANIFEST = [
  {
    id: 'stickman-hero',
    dest: join(charsDir, 'stickman-hero.glb'),
    license: 'CC0 (Three.js sample — smoke only)',
    sizeHint: '~2MB',
    doc: 'Replace with Quaternius/Kenney rig via manual download',
    url: null,
  },
  {
    id: 'living_room',
    dest: join(envDir, 'living_room.glb'),
    license: 'User-provided CC0 room pack',
    sizeHint: '5–40MB',
    doc: 'KayKit / Kenney furniture GLB',
    url: null,
  },
  {
    id: 'street',
    dest: join(envDir, 'street.glb'),
    license: 'User-provided CC0',
    sizeHint: '5–40MB',
    doc: 'City/suburban diorama GLB',
    url: null,
  },
  {
    id: 'park',
    dest: join(envDir, 'park.glb'),
    license: 'User-provided CC0',
    sizeHint: '5–40MB',
    doc: 'Kenney Nature Kit — export one scene GLB',
    url: null,
  },
  {
    id: 'office',
    dest: join(envDir, 'office.glb'),
    license: 'User-provided CC0',
    sizeHint: '5–40MB',
    doc: 'Office desk/chair room GLB',
    url: null,
  },
  {
    id: 'bedroom',
    dest: join(envDir, 'bedroom.glb'),
    license: 'User-provided CC0',
    sizeHint: '5–40MB',
    doc: 'Bedroom interior GLB (Phase 7)',
    url: null,
  },
  {
    id: 'bathroom',
    dest: join(envDir, 'bathroom.glb'),
    license: 'User-provided CC0',
    sizeHint: '5–40MB',
    doc: 'Bathroom interior GLB (Phase 7)',
    url: null,
  },
];

const SMOKE_URLS = {
  hero: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
  env: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/models/gltf/LittlestTokyo.glb',
};

function list() {
  console.log('CC0 GLB manifest (no download without --confirm-download):\n');
  for (const row of MANIFEST) {
    console.log(`- ${row.id}`);
    console.log(`  dest: ${row.dest.replace(ROOT + '\\', '').replace(ROOT + '/', '')}`);
    console.log(`  license: ${row.license}`);
    console.log(`  size: ${row.sizeHint}`);
    console.log(`  ${row.doc}`);
    console.log('');
  }
}

async function fetchToFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  return buf.length;
}

async function smokeTest() {
  mkdirSync(charsDir, { recursive: true });
  mkdirSync(envDir, { recursive: true });
  console.log('Downloading Khronos glTF sample models for smoke-test...');
  const heroBytes = await fetchToFile(
    SMOKE_URLS.hero,
    join(charsDir, 'stickman-hero.glb'),
  );
  const envBytes = await fetchToFile(SMOKE_URLS.env, join(envDir, '_env-smoke.glb'));
  for (const id of [
    'living_room',
    'street',
    'park',
    'office',
    'bedroom',
    'bathroom',
  ]) {
    copyFileSync(join(envDir, '_env-smoke.glb'), join(envDir, `${id}.glb`));
  }
  const log = {
    installedAt: new Date().toISOString(),
    mode: 'smoke-test',
    source: 'Khronos glTF-Sample-Models (NOT production art)',
    heroBytes,
    envBytes,
    entries: MANIFEST.map((m) => m.id),
  };
  writeFileSync(
    join(DATA, 'studio', 'asset-install-log.json'),
    JSON.stringify(log, null, 2),
  );
  console.log('Smoke-test GLBs installed. Replace with CC0 art before release.');
}

async function confirmDownload() {
  const withUrl = MANIFEST.filter((m) => m.url);
  if (withUrl.length === 0) {
    console.log(
      'No automatic URLs configured yet. Use --smoke-test OR place GLBs manually per data/assets/*/README.md',
    );
    process.exit(1);
  }
  mkdirSync(charsDir, { recursive: true });
  mkdirSync(envDir, { recursive: true });
  const logEntries = [];
  for (const row of withUrl) {
    console.log(`Fetching ${row.id}...`);
    const res = await fetch(row.url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${row.url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(row.dest, buf);
    logEntries.push({
      id: row.id,
      url: row.url,
      license: row.license,
      bytes: buf.length,
    });
  }
  writeFileSync(
    join(DATA, 'studio', 'asset-install-log.json'),
    JSON.stringify(
      { installedAt: new Date().toISOString(), mode: 'confirm-download', entries: logEntries },
      null,
      2,
    ),
  );
  console.log('Download complete.');
}

const args = new Set(process.argv.slice(2));
if (args.has('--list') || args.size === 0) {
  list();
  process.exit(0);
}
if (args.has('--smoke-test')) {
  await smokeTest();
  process.exit(0);
}
if (args.has('--confirm-download')) {
  await confirmDownload();
  process.exit(0);
}
console.log('Unknown flags. Use --list | --smoke-test | --confirm-download');