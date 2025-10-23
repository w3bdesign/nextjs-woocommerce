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
