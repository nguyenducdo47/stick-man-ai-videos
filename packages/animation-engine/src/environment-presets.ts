import {
  ENVIRONMENT_ID_LIST,
  type EnvironmentId,
} from '@ai-video-studio/validation';

export interface EnvironmentGlbTransform {
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** Multiplier applied after auto-fit scale. */
  scale?: number;
}

export interface EnvironmentLightingDef {
  ambient: number;
  sunPosition: [number, number, number];
  sunIntensity: number;
  hemisphereSky: string;
  hemisphereGround: string;
  hemisphereIntensity: number;
  fogNear: number;
  fogFar: number;
}

export interface EnvironmentPresetDef {
  id: EnvironmentId;
  label: string;
  description: string;
  /** Legacy prop ids (studio fallback only). Illustrated scenes use dedicated geometry. */
  propIds: string[];
  skyColor: string;
  groundColor: string;
  lighting: EnvironmentLightingDef;
  /** Optional tweak when `data/assets/environments/{id}.glb` is installed. */
  glbTransform?: EnvironmentGlbTransform;
}

const SUNNY_OUTDOOR: EnvironmentLightingDef = {
  ambient: 0.62,
  sunPosition: [6, 10, 4],
  sunIntensity: 1.35,
  hemisphereSky: '#bae6fd',
  hemisphereGround: '#4ade80',
  hemisphereIntensity: 0.45,
  fogNear: 18,
  fogFar: 42,
};

const COZY_INTERIOR: EnvironmentLightingDef = {
  ambient: 0.72,
  sunPosition: [3, 6, 2],
  sunIntensity: 0.85,
  hemisphereSky: '#fff7ed',
  hemisphereGround: '#d6d3d1',
  hemisphereIntensity: 0.55,
  fogNear: 14,
  fogFar: 32,
};

const BRIGHT_OFFICE: EnvironmentLightingDef = {
  ambient: 0.78,
  sunPosition: [2, 8, 5],
  sunIntensity: 1.05,
  hemisphereSky: '#f8fafc',
  hemisphereGround: '#d6d3d1',
  hemisphereIntensity: 0.5,
  fogNear: 16,
  fogFar: 36,
};

export const ENVIRONMENT_PRESETS: Record<EnvironmentId, EnvironmentPresetDef> = {
  studio_grid: {
    id: 'studio_grid',
    label: 'Studio grid',
    description: 'Default editor grid (Phase 3).',
    propIds: [],
    skyColor: '#09090b',
    groundColor: '#0c0c0e',
    lighting: {
      ambient: 0.55,
      sunPosition: [4, 8, 4],
      sunIntensity: 1.1,
      hemisphereSky: '#27272a',
      hemisphereGround: '#18181b',
      hemisphereIntensity: 0.35,
      fogNear: 10,
      fogFar: 28,
    },
  },
  living_room: {
    id: 'living_room',
    label: 'Living room',
    description: 'Warm illustrated interior — sofa, lamp, TV.',
    propIds: [],
    skyColor: '#fff7ed',
    groundColor: '#d6d3d1',
    lighting: COZY_INTERIOR,
    glbTransform: { position: [0, 0, 0], scale: 1 },
  },
  bedroom: {
    id: 'bedroom',
    label: 'Bedroom',
    description: 'Cozy bed, nightstand, soft lamp light.',
    propIds: [],
    skyColor: '#e0e7ff',
    groundColor: '#d4d4d8',
    lighting: {
      ambient: 0.68,
      sunPosition: [2, 5, 3],
      sunIntensity: 0.65,
      hemisphereSky: '#e0e7ff',
      hemisphereGround: '#a1a1aa',
      hemisphereIntensity: 0.5,
      fogNear: 12,
      fogFar: 30,
    },
    glbTransform: { position: [0, 0, 0], scale: 1 },
  },
  bathroom: {
    id: 'bathroom',
    label: 'Bathroom',
    description: 'Tiles, tub, mirror — bright clean interior.',
    propIds: [],
    skyColor: '#ecfeff',
    groundColor: '#e4e4e7',
    lighting: {
      ambient: 0.82,
      sunPosition: [1, 7, 2],
      sunIntensity: 0.75,
      hemisphereSky: '#f0fdfa',
      hemisphereGround: '#d4d4d8',
      hemisphereIntensity: 0.55,
      fogNear: 10,
      fogFar: 26,
    },
    glbTransform: { position: [0, 0, 0], scale: 1 },
  },
  street: {
    id: 'street',
    label: 'Suburban street',
    description: 'Sidewalk, grass, buildings, park trees.',
    propIds: [],
    skyColor: '#7dd3fc',
    groundColor: '#4ade80',
    lighting: SUNNY_OUTDOOR,
    glbTransform: { position: [0, 0, -2], scale: 1 },
  },
  park: {
    id: 'park',
    label: 'Park',
    description: 'Pine trees, pond, gazebo, path.',
    propIds: [],
    skyColor: '#38bdf8',
    groundColor: '#22c55e',
    lighting: SUNNY_OUTDOOR,
    glbTransform: { position: [0, 0, 0], scale: 1.05 },
  },
  office: {
    id: 'office',
    label: 'Office',
    description: 'Desks, orange chairs, window, shelving.',
    propIds: [],
    skyColor: '#f1f5f9',
    groundColor: '#d6d3d1',
    lighting: BRIGHT_OFFICE,
    glbTransform: { position: [0, 0, -1], scale: 1 },
  },
};

export function resolveEnvironmentId(raw: string | null | undefined): EnvironmentId {
  const key = (raw ?? '').trim().toLowerCase();
  if ((ENVIRONMENT_ID_LIST as readonly string[]).includes(key)) {
    return key as EnvironmentId;
  }
  return 'studio_grid';
}