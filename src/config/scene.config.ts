/**
 * Scene Configuration
 *
 * Defines spatial boundaries and environmental constants for the 3D scene.
 * This configuration establishes the coordinate system and spatial constraints
 * that other systems (camera, models, UI overlays) can reference.
 *
 * Coordinate System Convention:
 * - X-axis: Left (-) to Right (+)
 * - Y-axis: Down (-) to Up (+)
 * - Z-axis: Away from camera (-) to Toward camera (+)
 */

/**
 * Scene boundary constraints for camera and model positioning
 *
 * These values define the physical limits of the 3D environment and ensure
 * consistent spatial relationships between the camera, models, and scene elements.
 */
export const SCENE_BOUNDARIES = {
  /**
   * Back wall Z position (world units)
   * -3 = wall is 3 units away from the origin toward negative Z
   *
   * This matches the wall mesh position in Canvas3D.component.tsx
   * and ensures models are positioned between the camera and wall.
   */
  WALL_Z_POSITION: -3,

  /**
   * Camera safety margin (world units)
   * 0.5 = camera must stay at least 0.5 units in front of the wall
   *
   * This prevents:
   * - Camera from clipping through the wall
   * - Back face of the wall becoming visible
   * - Disorienting views from behind scene elements
   *
   * Calculation: minCameraZ = WALL_Z_POSITION + CAMERA_SAFETY_MARGIN
   * Example: -3 + 0.5 = -2.5 (camera cannot go beyond Z = -2.5)
   */
  CAMERA_SAFETY_MARGIN: 0.5,

  /**
   * Floor Y position (world units)
   * 0 = floor plane at Y = 0 (ground level)
   *
   * All models are positioned relative to this ground plane.
   * Included here for future extensibility (e.g., multi-level scenes).
   */
  FLOOR_Y_POSITION: 0,
} as const;

/**
 * Combined scene configuration export
 */
export const SCENE_CONFIG = {
  boundaries: SCENE_BOUNDARIES,
} as const;

export default SCENE_CONFIG;
