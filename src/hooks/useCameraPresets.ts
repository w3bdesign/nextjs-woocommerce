/**
 * useCameraPresets Hook
 *
 * Generates camera presets based on camera configuration and model world state.
 * Handles spherical to cartesian coordinate conversion for camera positioning.
 */

import { CAMERA_CONFIG } from '@/config/camera.config';
import type { CameraPreset, CameraPresetId } from '@/stores/cameraStore';
import type { CameraConfig } from '@/types/configurator';
import {
  calculateBoundingBoxSize,
  type WorldBoundingBox,
} from '@/utils/boundingBox';
import { calculateBaseDistance, fitRadiusForFOV } from '@/utils/camera';
import { useMemo } from 'react';
import * as THREE from 'three';

interface ModelWorld {
  readonly position: readonly [number, number, number];
  readonly height: number;
  readonly boundingBox?: WorldBoundingBox;
}

interface UseCameraPresetsResult {
  /** Generated camera presets based on configuration and model state */
  presets: Record<CameraPresetId, CameraPreset>;
  /** Convert spherical coordinates to cartesian position */
  sphericalToCartesian: (preset: CameraPreset) => THREE.Vector3;
}

/**
 * Custom hook for generating camera presets with memoization
 *
 * @param cameraConfig - Optional camera configuration (position, fov, etc.)
 * @param modelWorld - Optional runtime model world state with bounding box
 * @param aspect - Viewport aspect ratio (width / height)
 * @returns Object with presets and sphericalToCartesian converter
 *
 * @example
 * ```tsx
 * const { presets, sphericalToCartesian } = useCameraPresets(
 *   cameraConfig,
 *   sceneSnap.modelWorld,
 *   size.width / size.height
 * );
 *
 * const position = sphericalToCartesian(presets['front-left']);
 * ```
 */
export const useCameraPresets = (
  cameraConfig?: CameraConfig,
  modelWorld?: ModelWorld | null,
  aspect = 16 / 10,
): UseCameraPresetsResult => {
  // Generate presets based on camera configuration and model world state
  const presets = useMemo(() => {
    const modelPos = modelWorld?.position || [0, 0, 0];

    // Calculate base distance - prefer using bounding box if available
    let baseDistance: number;
    if (modelWorld?.boundingBox) {
      const size = calculateBoundingBoxSize(modelWorld.boundingBox);
      const fov = cameraConfig?.fov ?? 45;
      baseDistance = fitRadiusForFOV(
        [size.width, size.height, size.depth],
        fov,
        aspect,
      );
    } else {
      const configuredPosition = cameraConfig?.position || [0, 0, 4];
      baseDistance = calculateBaseDistance(
        configuredPosition as [number, number, number],
      );
    }

    // Compute target height with upward bias for pleasing framing
    let targetHeight = modelPos[1];
    if (modelWorld && typeof modelWorld.height === 'number') {
      const centerY = modelPos[1] + modelWorld.height * 0.5;
      targetHeight =
        centerY + modelWorld.height * CAMERA_CONFIG.angles.VERTICAL_BIAS;
    } else {
      targetHeight = modelPos[1] + 0.2;
    }

    // Generate three camera presets using spherical coordinates
    return {
      'front-left': {
        id: 'front-left',
        name: 'Elevated Three-Quarter Left',
        spherical: [
          baseDistance,
          Math.PI * CAMERA_CONFIG.angles.THETA,
          Math.PI * CAMERA_CONFIG.angles.PHI,
        ] as const,
        target: [modelPos[0], targetHeight, modelPos[2]] as const,
      },
      front: {
        id: 'front',
        name: 'Frontal (Au Face)',
        spherical: [
          baseDistance,
          0,
          Math.PI * CAMERA_CONFIG.angles.PHI,
        ] as const,
        target: [modelPos[0], targetHeight, modelPos[2]] as const,
      },
      'front-right': {
        id: 'front-right',
        name: 'Elevated Three-Quarter Right',
        spherical: [
          baseDistance,
          -Math.PI * CAMERA_CONFIG.angles.THETA,
          Math.PI * CAMERA_CONFIG.angles.PHI,
        ] as const,
        target: [modelPos[0], targetHeight, modelPos[2]] as const,
      },
    } as Record<CameraPresetId, CameraPreset>;
  }, [cameraConfig, modelWorld, aspect]);

  /**
   * Convert spherical coordinates to cartesian position
   * Spherical: [radius, theta (horizontal), phi (vertical from top)]
   * Cartesian: Vector3(x, y, z)
   */
  const sphericalToCartesian = useMemo(
    () =>
      (preset: CameraPreset): THREE.Vector3 => {
        const [radius, theta, phi] = preset.spherical;
        const [tx, ty, tz] = preset.target;

        const spherical = new THREE.Spherical(radius, phi, theta);
        const offset = new THREE.Vector3().setFromSpherical(spherical);

        return new THREE.Vector3(tx + offset.x, ty + offset.y, tz + offset.z);
      },
    [],
  );

  return { presets, sphericalToCartesian };
};
