/**
 * Model positioning utilities for 3D scene
 *
 * Provides functions for calculating proper model positions in world space,
 * with support for wall-pinned and symmetric scaling behaviors.
 */

import { SCENE_BOUNDARIES } from '@/config/scene.config';

/**
 * Calculate the Z-axis offset needed for proper model positioning
 *
 * Supports two positioning modes:
 * 1. Wall-pinned: Back face stays flush with wall, depth expands forward only
 * 2. Centered/other: Symmetric scaling around model center (legacy behavior)
 *
 * @param basePositionZ - Base Z position from model config
 * @param boundingBox - Model's local-space bounding box
 * @param scaleZ - Relative scale factor for Z-axis (finalScale / baseScale)
 * @param positioning - Optional positioning configuration from model config
 * @returns Z offset to apply to model position
 *
 * @example
 * // Wall-pinned model that expands forward only
 * const offset = calculateDepthOffset(
 *   -2.73,                    // base position
 *   { min: { z: -0.277 }, max: { z: 0.664 } },  // bbox
 *   1.333,                    // scale increased by 33.3%
 *   { type: 'wall-pinned', wallOffset: 0 }
 * );
 */
export function calculateDepthOffset(
  basePositionZ: number,
  boundingBox: { min: { z: number }; max: { z: number } },
  scaleZ: number,
  positioning?: { type: string; wallOffset?: number },
): number {
  console.log(
    '[calculateDepthOffset] 📐 CALLED:',
    JSON.stringify(
      {
        basePositionZ,
        'boundingBox.min.z': boundingBox.min.z,
        'boundingBox.max.z': boundingBox.max.z,
        scaleZ,
        'positioning.type': positioning?.type,
        'positioning.wallOffset': positioning?.wallOffset,
      },
      null,
      2,
    ),
  );

  if (positioning?.type !== 'wall-pinned') {
    // For non-wall-pinned models, use symmetric scaling (current behavior)
    if (scaleZ === 1) {
      console.log('[calculateDepthOffset] ➡️  No scaling (scaleZ=1), offset=0');
      return 0;
    }
    const originalDepth = boundingBox.max.z - boundingBox.min.z;
    const offset = (originalDepth * (scaleZ - 1)) / 2;
    console.log(
      '[calculateDepthOffset] ➡️  Symmetric scaling:',
      JSON.stringify(
        {
          originalDepth,
          offset,
        },
        null,
        2,
      ),
    );
    return offset;
  }

  // For wall-pinned models: keep back face at wall, expand forward only
  const wallZ = SCENE_BOUNDARIES.WALL_Z_POSITION;
  const wallOffset = positioning.wallOffset ?? 0;

  // Calculate where center should be after scaling to keep back face at wall
  // In world space: backFaceWorldZ = centerZ + (boundingBox.min.z * scaleZ)
  // We want: backFaceWorldZ = wallZ + wallOffset
  // Therefore: centerZ = wallZ + wallOffset - (boundingBox.min.z * scaleZ)
  const targetCenterZ = wallZ + wallOffset - boundingBox.min.z * scaleZ;
  const offset = targetCenterZ - basePositionZ;

  console.log(
    '[calculateDepthOffset] 🧲 Wall-pinned calculation:',
    JSON.stringify(
      {
        wallZ,
        wallOffset,
        'boundingBox.min.z * scaleZ': boundingBox.min.z * scaleZ,
        targetCenterZ,
        basePositionZ,
        offset,
        'RESULT: outerPosition[2]': basePositionZ + offset,
      },
      null,
      2,
    ),
  );

  return offset;
}
