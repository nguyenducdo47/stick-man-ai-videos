import { ENVIRONMENT_PRESETS } from '@ai-video-studio/animation-engine';
import type { EnvironmentId } from '@ai-video-studio/validation';
import { useGLTF } from '@react-three/drei';
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import type { Group, Object3D } from 'three';
import { Box3, Vector3 } from 'three';

const TARGET_WIDTH = 14;

export type EnvironmentGlbLoadedProps = {
  glbUrl: string;
  environmentId: EnvironmentId;
};

function fitGroupToFloor(group: Group, targetWidth: number) {
  const box = new Box3().setFromObject(group);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  group.position.sub(center);
  group.position.y -= box.min.y;
  const maxXZ = Math.max(size.x, size.z, 0.01);
  const autoScale = targetWidth / maxXZ;
  group.scale.setScalar(autoScale);
}

export function EnvironmentGlbLoaded({
  glbUrl,
  environmentId,
}: EnvironmentGlbLoadedProps) {
  const root = useRef<Group>(null);
  const gltf = useGLTF(glbUrl);
  const transform = ENVIRONMENT_PRESETS[environmentId].glbTransform;

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((obj: Object3D) => {
      const mesh = obj as Object3D & {
        isMesh?: boolean;
        castShadow?: boolean;
        receiveShadow?: boolean;
      };
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return cloned;
  }, [gltf.scene]);

  useLayoutEffect(() => {
    const g = root.current;
    if (!g) return;
    while (g.children.length > 0) {
      g.remove(g.children[0]!);
    }
    g.add(scene);
    fitGroupToFloor(g, TARGET_WIDTH);
    if (transform?.scale != null) {
      g.scale.multiplyScalar(transform.scale);
    }
    if (transform?.position) {
      g.position.x += transform.position[0];
      g.position.y += transform.position[1];
      g.position.z += transform.position[2];
    }
    if (transform?.rotation) {
      g.rotation.set(...transform.rotation);
    }
  }, [scene, transform]);

  return <group ref={root} />;
}