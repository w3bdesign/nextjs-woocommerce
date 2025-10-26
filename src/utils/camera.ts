/**
 * Camera-related utility functions
 */

/**
 * Calculate the distance from origin for a camera position
 * Uses Euclidean distance formula: √(x² + y² + z²)
 *
 * @param position - Camera position as [x, y, z]
 * @returns Distance from origin
 */
export const calculateBaseDistance = (
  position: [number, number, number],
): number => {
  return Math.sqrt(position[0] ** 2 + position[1] ** 2 + position[2] ** 2);
};

/**
 * Compute a camera radius (distance from target) so a box of given size
 * fits within the camera frustum defined by vertical fov and aspect ratio.
 *
 * @param size - [width, height, depth] of the bounding box in world units
 * @param fovDeg - vertical field of view in degrees
 * @param aspect - viewport aspect ratio (width / height), default 16/10
 * @param safetyFactor - multiply radius by safetyFactor (default 1.1)
 */
export const fitRadiusForFOV = (
  size: [number, number, number],
  fovDeg: number,
  aspect = 16 / 10,
  safetyFactor = 1.1,
): number => {
  const [width, height] = [size[0], size[1]];

  // Convert degrees to radians
  const fovY = (fovDeg * Math.PI) / 180;
  // Horizontal fov derived from vertical fov and aspect
  const fovX = 2 * Math.atan(Math.tan(fovY / 2) * aspect);

  // Required distances so the half-size fits within each frustum axis
  const distY = height / 2 / Math.tan(fovY / 2);
  const distX = width / 2 / Math.tan(fovX / 2);

  const radius = Math.max(distX, distY) * safetyFactor;
  return radius;
};
